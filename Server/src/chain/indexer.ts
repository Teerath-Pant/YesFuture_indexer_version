import "dotenv/config";
import { and, desc, eq, inArray, sql } from "drizzle-orm";
import { db, schema } from "../db/client.js";
import { contract, provider } from "./contract.js";
import { seedRootAdmin } from "../db/seed.js";

const DEPLOY_BLOCK = BigInt(process.env.DEPLOY_BLOCK ?? "0");
const LOG_BATCH_SIZE = BigInt(process.env.LOG_BATCH_SIZE ?? "2000");
const POLL_INTERVAL_MS = Number(process.env.POLL_INTERVAL_MS ?? "5000");
const MAX_ANCESTOR_CLIMB = 500; // safety bound, not a business rule

type Tx = Parameters<Parameters<typeof db.transaction>[0]>[0];

// ethers decodes event args as checksummed (mixed-case) addresses; every API
// route lowercases its :address param before querying. Normalize to lowercase
// at ingestion so DB storage and route lookups always agree.
const lc = (a: string): string => a.toLowerCase();

const priceCache = new Map<string, bigint>(); // `${track}:${packageId}` -> price
async function priceFor(track: "MATRIX" | "SPONSOR" | "LEVEL", packageId: number): Promise<bigint> {
  const key = `${track}:${packageId}`;
  const cached = priceCache.get(key);
  if (cached !== undefined) return cached;
  const price: bigint =
    track === "MATRIX" ? await contract.getMatrixPrice(packageId)
    : track === "SPONSOR" ? await contract.getSponsorPrice(packageId)
    : await contract.getLevelPrice(packageId);
  priceCache.set(key, price);
  return price;
}

async function getLastProcessedBlock(): Promise<bigint> {
  const rows = await db.select().from(schema.indexerState).where(eq(schema.indexerState.id, 1));
  if (rows.length === 0) {
    await db.insert(schema.indexerState).values({ id: 1, lastProcessedBlock: DEPLOY_BLOCK - 1n });
    return DEPLOY_BLOCK - 1n;
  }
  return rows[0].lastProcessedBlock;
}

const blockTimestampCache = new Map<number, Date>();
async function timestampOf(blockNumber: number): Promise<Date> {
  const cached = blockTimestampCache.get(blockNumber);
  if (cached) return cached;
  const block = await provider.getBlock(blockNumber);
  const ts = new Date(Number(block!.timestamp) * 1000);
  blockTimestampCache.set(blockNumber, ts);
  return ts;
}

function sumByKey(rows: { key: string; amount: bigint }[]): { key: string; amount: bigint }[] {
  const totals = new Map<string, bigint>();
  for (const r of rows) totals.set(r.key, (totals.get(r.key) ?? 0n) + r.amount);
  return [...totals.entries()].map(([key, amount]) => ({ key, amount }));
}

function countByKey(keys: string[]): { key: string; count: bigint }[] {
  const totals = new Map<string, bigint>();
  for (const k of keys) totals.set(k, (totals.get(k) ?? 0n) + 1n);
  return [...totals.entries()].map(([key, count]) => ({ key, count }));
}

// Batch-resolve each address's direct sponsor from user_details, for stamping
// sponsorAddress onto transactions rows without a query per row.
async function resolveSponsors(tx: Tx, addresses: string[]): Promise<Map<string, string | null>> {
  const unique = [...new Set(addresses)];
  const map = new Map<string, string | null>(unique.map((a) => [a, null]));
  if (!unique.length) return map;
  const rows = await tx.select({ userAddress: schema.userDetails.userAddress, sponsorAddress: schema.userDetails.sponsorAddress })
    .from(schema.userDetails).where(inArray(schema.userDetails.userAddress, unique));
  for (const r of rows) map.set(r.userAddress, r.sponsorAddress);
  return map;
}

async function resolveStringIds(tx: Tx, addresses: string[]): Promise<Map<string, string>> {
  const unique = [...new Set(addresses.filter(Boolean))];
  const map = new Map<string, string>();
  if (!unique.length) return map;
  const rows = await tx
    .select({
      memberAddress: schema.userRegistrations.memberAddress,
      stringId: schema.userRegistrations.stringId,
    })
    .from(schema.userRegistrations)
    .where(inArray(schema.userRegistrations.memberAddress, unique));
  for (const r of rows) map.set(r.memberAddress, r.stringId);
  return map;
}

type SponsorCycleSlotInput = {
  packageId: number;
  cyclePosition: number;
  userAddress: string;
  directPartnerAddress: string;
  totalReferralIncome: string;
  isHeld: boolean;
  blockNumber: bigint;
  txHash: string;
  logIndex: number;
  blockTimestamp: Date;
};

async function insertSponsorCycleUiRows(tx: Tx, inputRows: SponsorCycleSlotInput[]) {
  const rows = inputRows
    .filter((r) => r.packageId > 0 && r.userAddress && r.directPartnerAddress)
    .sort((a, b) => (
      a.blockNumber === b.blockNumber
        ? a.logIndex - b.logIndex
        : a.blockNumber < b.blockNumber ? -1 : 1
    ));
  if (!rows.length) return;

  const addressesForIds = [
    ...rows.map((r) => r.userAddress),
    ...rows.map((r) => r.directPartnerAddress),
  ];
  const [stringIds, sponsorMap] = await Promise.all([
    resolveStringIds(tx, addressesForIds),
    resolveSponsors(tx, rows.map((r) => r.userAddress)),
  ]);
  const sponsorStringIds = await resolveStringIds(
    tx,
    [...new Set([...sponsorMap.values()].filter((a): a is string => !!a))],
  );

  const cycleState = new Map<string, { cycle: bigint; position: number }>();
  const getState = async (userAddress: string, packageId: number) => {
    const key = `${userAddress}:${packageId}`;
    const cached = cycleState.get(key);
    if (cached) return cached;

    const latest = await tx
      .select({
        cycle: schema.sponsorCycleUi.cycle,
        cyclePosition: schema.sponsorCycleUi.cyclePosition,
      })
      .from(schema.sponsorCycleUi)
      .where(and(
        eq(schema.sponsorCycleUi.userAddress, userAddress),
        eq(schema.sponsorCycleUi.packageId, packageId),
      ))
      .orderBy(desc(schema.sponsorCycleUi.blockNumber), desc(schema.sponsorCycleUi.logIndex))
      .limit(1);

    const state = latest[0]
      ? { cycle: latest[0].cycle, position: latest[0].cyclePosition }
      : { cycle: 1n, position: 0 };
    cycleState.set(key, state);
    return state;
  };

  const values: (typeof schema.sponsorCycleUi.$inferInsert)[] = [];
  for (const row of rows) {
    const state = await getState(row.userAddress, row.packageId);
    const cycle = state.position > 0 && row.cyclePosition <= state.position
      ? state.cycle + 1n
      : state.cycle;
    state.cycle = cycle;
    state.position = row.cyclePosition;

    const sponsorAddress = sponsorMap.get(row.userAddress) ?? "";
    values.push({
      packageId: row.packageId,
      cycle,
      cyclePosition: row.cyclePosition,
      userAddress: row.userAddress,
      sponsorAddress,
      sponsorStringId: sponsorStringIds.get(sponsorAddress) ?? "",
      directPartnerAddress: row.directPartnerAddress,
      directPartnerStringId: stringIds.get(row.directPartnerAddress) ?? "ID ...",
      totalReferralIncome: row.isHeld ? "0" : row.totalReferralIncome,
      isHeld: row.isHeld,
      blockNumber: row.blockNumber,
      txHash: row.txHash,
      logIndex: row.logIndex,
      blockTimestamp: row.blockTimestamp,
    });
  }

  if (values.length) {
    await tx.insert(schema.sponsorCycleUi).values(values).onConflictDoNothing();
  }
}

// --- registration processing (userDetails, dashboard, totalMembersByLevel) --

async function processRegistration(
  tx: Tx,
  reg: { memberAddress: string; sponsorAddress: string; stringId: string; joinDate: Date },
  sponsorStringIds: Map<string, string>,
) {
  await tx.insert(schema.userDetails).values({
    userAddress: reg.memberAddress,
    sponsorAddress: reg.sponsorAddress,
    userName: null,
    dateOfRegistration: reg.joinDate,
  }).onConflictDoNothing();

  await tx.insert(schema.dashboard).values({
    userAddress: reg.memberAddress,
    sponsorId: sponsorStringIds.get(reg.sponsorAddress) ?? reg.sponsorAddress,
  }).onConflictDoNothing();

  // walk every ancestor, +1 total team + total_members_by_level at that depth
  // (mirrors the deleted on-chain _buildLevelTeam walk)
  let ancestor = reg.sponsorAddress;
  let depth = 1;
  for (let i = 0; i < MAX_ANCESTOR_CLIMB && ancestor; i++) {
    const ancestorRow = await tx.select({ sponsorAddress: schema.userDetails.sponsorAddress })
      .from(schema.userDetails).where(eq(schema.userDetails.userAddress, ancestor));
    if (ancestorRow.length === 0) break; // hit an unindexed root — stop climb

    await tx
      .update(schema.dashboard)
      .set({ totalTeam: sql`${schema.dashboard.totalTeam} + 1`, updatedAt: sql`now()` })
      .where(eq(schema.dashboard.userAddress, ancestor));

    await tx.insert(schema.totalMembersByLevel).values({
      userAddress: ancestor,
      sponsorAddress: ancestorRow[0].sponsorAddress,
      levelId: depth,
      totalCount: 1n,
    }).onConflictDoUpdate({
      target: [schema.totalMembersByLevel.userAddress, schema.totalMembersByLevel.levelId],
      set: { totalCount: sql`${schema.totalMembersByLevel.totalCount} + 1`, updatedAt: sql`now()` },
    });

    ancestor = ancestorRow[0].sponsorAddress;
    depth++;
  }
}

async function bumpDirectPartners(tx: Tx, sponsorAddresses: string[]) {
  for (const { key: sponsorAddress, count } of countByKey(sponsorAddresses)) {
    await tx
      .update(schema.dashboard)
      .set({ directPartners: sql`${schema.dashboard.directPartners} + ${count}`, updatedAt: sql`now()` })
      .where(eq(schema.dashboard.userAddress, sponsorAddress));
  }
}

async function bumpIncome(
  tx: Tx,
  events: { receiver: string; amount: string }[],
  column: "totalMagicLevelIncome" | "totalMagicGoldMatrixIncome" | "totalSponsorIncome",
) {
  const totals = sumByKey(events.map((e) => ({ key: e.receiver, amount: BigInt(e.amount) })));
  for (const { key: walletAddress, amount } of totals) {
    await tx
      .insert(schema.income)
      .values({ walletAddress, [column]: amount.toString() } as any)
      .onConflictDoUpdate({
        target: schema.income.walletAddress,
        set: {
          [column]: sql`${schema.income[column]} + ${amount.toString()}`,
          updatedAt: sql`now()`,
        } as any,
      });
  }
}

// --- main chunk processor ---------------------------------------------------

async function processChunk(fromBlock: bigint, toBlock: bigint) {
  const [
    registrations, matrixIncomes, directIncomes, levelIncomes,
    manualUpgrades, matrixAutoUpgrades, sponsorAutoUpgrades,
    matrixPlacements, level5Reentries, sponsorReentries,
    matrixIncomeHelds, sponsorIncomeHelds,
    incomeCappeds, sponsorIncomeRedirecteds, levelIncomeRedirecteds,
  ] = await Promise.all([
    contract.queryFilter(contract.filters.UserRegistered(), fromBlock, toBlock),
    contract.queryFilter(contract.filters.MatrixIncome(), fromBlock, toBlock),
    contract.queryFilter(contract.filters.DirectIncome(), fromBlock, toBlock),
    contract.queryFilter(contract.filters.LevelIncome(), fromBlock, toBlock),
    contract.queryFilter(contract.filters.ManualUpgrade(), fromBlock, toBlock),
    contract.queryFilter(contract.filters.MatrixAutoUpgrade(), fromBlock, toBlock),
    contract.queryFilter(contract.filters.SponsorAutoUpgrade(), fromBlock, toBlock),
    contract.queryFilter(contract.filters.MatrixPlaced(), fromBlock, toBlock),
    contract.queryFilter(contract.filters.Level5ReEntry(), fromBlock, toBlock),
    contract.queryFilter(contract.filters.SponsorReEntry(), fromBlock, toBlock),
    contract.queryFilter(contract.filters.MatrixIncomeHeld(), fromBlock, toBlock),
    contract.queryFilter(contract.filters.SponsorIncomeHeld(), fromBlock, toBlock),
    contract.queryFilter(contract.filters.IncomeCapped(), fromBlock, toBlock),
    contract.queryFilter(contract.filters.SponsorIncomeRedirected(), fromBlock, toBlock),
    contract.queryFilter(contract.filters.LevelIncomeRedirected(), fromBlock, toBlock),
  ]);

  const blockNumbers = new Set<number>();
  for (const log of [
    ...registrations, ...matrixIncomes, ...directIncomes, ...levelIncomes,
    ...manualUpgrades, ...matrixAutoUpgrades, ...sponsorAutoUpgrades,
    ...matrixPlacements, ...level5Reentries, ...sponsorReentries,
    ...matrixIncomeHelds, ...sponsorIncomeHelds,
    ...incomeCappeds, ...sponsorIncomeRedirecteds, ...levelIncomeRedirecteds,
  ]) blockNumbers.add(log.blockNumber);
  await Promise.all([...blockNumbers].map((bn) => timestampOf(bn)));

  await db.transaction(async (tx) => {
    // ---- raw per-type event-history tables (back the dedicated per-page reads) ----
    if (registrations.length) {
      await tx.insert(schema.userRegistrations).values(
        await Promise.all(registrations.map(async (log) => ({
          memberAddress: lc((log as any).args.user),
          sponsorAddress: lc((log as any).args._sponsor),
          memberId: (log as any).args.numericId as bigint,
          stringId: (log as any).args.stringId as string,
          blockNumber: BigInt(log.blockNumber),
          txHash: log.transactionHash,
          logIndex: log.index,
          blockTimestamp: await timestampOf(log.blockNumber),
        })))
      ).onConflictDoNothing();
    }

    if (matrixIncomes.length) {
      await tx.insert(schema.matrixIncomeEvents).values(
        await Promise.all(matrixIncomes.map(async (log) => ({
          receiver: lc((log as any).args.receiver),
          fromAddress: lc((log as any).args.from),
          packageId: Number((log as any).args.packageId),
          level: Number((log as any).args.level),
          amount: ((log as any).args.amount as bigint).toString(),
          blockNumber: BigInt(log.blockNumber),
          txHash: log.transactionHash,
          logIndex: log.index,
          blockTimestamp: await timestampOf(log.blockNumber),
        })))
      ).onConflictDoNothing();
    }

    if (directIncomes.length) {
      await tx.insert(schema.directIncomeEvents).values(
        await Promise.all(directIncomes.map(async (log) => ({
          receiver: lc((log as any).args.receiver),
          fromAddress: lc((log as any).args.from),
          packageId: Number((log as any).args.packageId),
          cycle: (log as any).args.cycle as bigint,
          amount: ((log as any).args.amount as bigint).toString(),
          blockNumber: BigInt(log.blockNumber),
          txHash: log.transactionHash,
          logIndex: log.index,
          blockTimestamp: await timestampOf(log.blockNumber),
        })))
      ).onConflictDoNothing();
    }

    if (levelIncomes.length) {
      await tx.insert(schema.levelIncomeEvents).values(
        await Promise.all(levelIncomes.map(async (log) => ({
          receiver: lc((log as any).args.receiver),
          fromAddress: lc((log as any).args.from),
          packageId: Number((log as any).args.packageId),
          level: Number((log as any).args.level),
          amount: ((log as any).args.amount as bigint).toString(),
          blockNumber: BigInt(log.blockNumber),
          txHash: log.transactionHash,
          logIndex: log.index,
          blockTimestamp: await timestampOf(log.blockNumber),
        })))
      ).onConflictDoNothing();
    }

    const manualPurchaseRows: any[] = [];
    for (const log of manualUpgrades) {
      const track = (log as any).args.track as "MATRIX" | "SPONSOR" | "LEVEL";
      const packageId = Number((log as any).args.packageId);
      const amount = await priceFor(track, packageId);
      manualPurchaseRows.push({
        memberAddress: lc((log as any).args.user),
        packageId, track, amount: amount.toString(), source: "MANUAL",
        blockNumber: BigInt(log.blockNumber), txHash: log.transactionHash, logIndex: log.index,
        blockTimestamp: await timestampOf(log.blockNumber),
      });
    }
    if (manualPurchaseRows.length) {
      await tx.insert(schema.packagePurchaseEvents).values(manualPurchaseRows).onConflictDoNothing();
    }

    const autoUpgradeRows: any[] = [];
    for (const log of matrixAutoUpgrades) {
      autoUpgradeRows.push({
        memberAddress: lc((log as any).args.user),
        packageId: Number((log as any).args.newPackageId), track: "MATRIX_AUTO",
        amount: ((log as any).args.priceUsed as bigint).toString(), source: "AUTO",
        blockNumber: BigInt(log.blockNumber), txHash: log.transactionHash, logIndex: log.index,
        blockTimestamp: await timestampOf(log.blockNumber),
      });
    }
    for (const log of sponsorAutoUpgrades) {
      autoUpgradeRows.push({
        memberAddress: lc((log as any).args.sponsor),
        packageId: Number((log as any).args.newPackageId), track: "SPONSOR_AUTO",
        amount: ((log as any).args.priceUsed as bigint).toString(), source: "AUTO",
        blockNumber: BigInt(log.blockNumber), txHash: log.transactionHash, logIndex: log.index,
        blockTimestamp: await timestampOf(log.blockNumber),
      });
    }
    if (autoUpgradeRows.length) {
      await tx.insert(schema.packagePurchaseEvents).values(autoUpgradeRows).onConflictDoNothing();
    }

    if (matrixPlacements.length) {
      await tx.insert(schema.matrixPlacements).values(
        await Promise.all(matrixPlacements.map(async (log) => ({
          packageId: Number((log as any).args.packageId),
          childAddress: lc((log as any).args.user),
          parentAddress: lc((log as any).args.matrixParent),
          sponsorAddress: lc((log as any).args.sponsor),
          blockNumber: BigInt(log.blockNumber),
          txHash: log.transactionHash,
          logIndex: log.index,
          blockTimestamp: await timestampOf(log.blockNumber),
        })))
      ).onConflictDoNothing();
    }

    if (level5Reentries.length) {
      await tx.insert(schema.level5Reentries).values(
        await Promise.all(level5Reentries.map(async (log) => ({
          userAddress: lc((log as any).args.user),
          packageId: Number((log as any).args.packageId),
          cycleNumber: (log as any).args.cycleNumber as bigint,
          phantomNode: lc((log as any).args.phantomNode),
          blockNumber: BigInt(log.blockNumber),
          txHash: log.transactionHash,
          logIndex: log.index,
          blockTimestamp: await timestampOf(log.blockNumber),
        })))
      ).onConflictDoNothing();
    }

    // ---- userDetails / dashboard / totalMembersByLevel ----
    if (registrations.length) {
      const sponsorAddrs = registrations.map((l) => lc((l as any).args._sponsor));
      const sponsorRows = await tx.select({ memberAddress: schema.userRegistrations.memberAddress, stringId: schema.userRegistrations.stringId })
        .from(schema.userRegistrations).where(inArray(schema.userRegistrations.memberAddress, [...new Set(sponsorAddrs)]));
      const sponsorStringIds = new Map(sponsorRows.map((r) => [r.memberAddress, r.stringId]));

      for (const log of registrations) {
        await processRegistration(tx, {
          memberAddress: lc((log as any).args.user),
          sponsorAddress: lc((log as any).args._sponsor),
          stringId: (log as any).args.stringId as string,
          joinDate: await timestampOf(log.blockNumber),
        }, sponsorStringIds);
      }

      await bumpDirectPartners(tx, sponsorAddrs);
    }

    // ---- income totals (all-time, backfill-safe running totals) ----
    await bumpIncome(tx, matrixIncomes.map((l) => ({
      receiver: lc((l as any).args.receiver), amount: ((l as any).args.amount as bigint).toString(),
    })), "totalMagicGoldMatrixIncome");
    await bumpIncome(tx, directIncomes.map((l) => ({
      receiver: lc((l as any).args.receiver), amount: ((l as any).args.amount as bigint).toString(),
    })), "totalSponsorIncome");
    await bumpIncome(tx, levelIncomes.map((l) => ({
      receiver: lc((l as any).args.receiver), amount: ((l as any).args.amount as bigint).toString(),
    })), "totalMagicLevelIncome");

    // ---- unified transactions feed ----
    const walletsNeedingSponsor = [
      ...registrations.map((l) => lc((l as any).args.user)),
      ...matrixIncomes.map((l) => lc((l as any).args.receiver)),
      ...directIncomes.map((l) => lc((l as any).args.receiver)),
      ...levelIncomes.map((l) => lc((l as any).args.receiver)),
      ...manualUpgrades.map((l) => lc((l as any).args.user)),
      ...matrixAutoUpgrades.map((l) => lc((l as any).args.user)),
      ...sponsorAutoUpgrades.map((l) => lc((l as any).args.sponsor)),
      ...matrixPlacements.map((l) => lc((l as any).args.user)),
      ...level5Reentries.map((l) => lc((l as any).args.user)),
      ...sponsorReentries.map((l) => lc((l as any).args.sponsor)),
      ...matrixIncomeHelds.map((l) => lc((l as any).args.user)),
      ...sponsorIncomeHelds.map((l) => lc((l as any).args.sponsor)),
      ...incomeCappeds.map((l) => lc((l as any).args.user)),
      ...sponsorIncomeRedirecteds.map((l) => lc((l as any).args.wouldBeReceiver)),
      ...levelIncomeRedirecteds.map((l) => lc((l as any).args.wouldBeReceiver)),
    ];
    const sponsorMap = await resolveSponsors(tx, walletsNeedingSponsor);
    // registrations' own sponsor is already known from the event itself
    for (const log of registrations) sponsorMap.set(lc((log as any).args.user), lc((log as any).args._sponsor));

    const sponsorPurchaseByTxPkg = new Map<string, string>();
    for (const row of [...manualPurchaseRows, ...autoUpgradeRows]) {
      if (row.track === "SPONSOR" || row.track === "SPONSOR_AUTO") {
        sponsorPurchaseByTxPkg.set(`${row.txHash}:${row.packageId}`, row.memberAddress);
      }
    }
    const sponsorReentryByTxPkg = new Map<string, string>();
    for (const log of sponsorReentries) {
      sponsorReentryByTxPkg.set(
        `${log.transactionHash}:${Number((log as any).args.packageId)}`,
        lc((log as any).args.sponsor),
      );
    }

    await insertSponsorCycleUiRows(tx, [
      ...(await Promise.all(directIncomes.map(async (log) => {
        const packageId = Number((log as any).args.packageId);
        const cyclePosition = Number((log as any).args.cycle) || 0;
        const reentrySponsor = cyclePosition === 5
          ? sponsorReentryByTxPkg.get(`${log.transactionHash}:${packageId}`)
          : undefined;
        // count==5 payout goes to nextUpline (see contract.sol _releaseDirectIncome),
        // but the slot being filled is eligibleSponsor's own position 5 — attribute
        // the row to eligibleSponsor (reentrySponsor), filled by the real buyer.
        // eligibleSponsor gets no money here (nextUpline does, via bumpIncome/
        // transactions feed separately), so this row carries 0 referral income.
        return {
          packageId,
          cyclePosition,
          userAddress: reentrySponsor ?? lc((log as any).args.receiver),
          directPartnerAddress: lc((log as any).args.from),
          totalReferralIncome: reentrySponsor
            ? "0"
            : ((log as any).args.amount as bigint).toString(),
          isHeld: false,
          blockNumber: BigInt(log.blockNumber),
          txHash: log.transactionHash,
          logIndex: log.index,
          blockTimestamp: await timestampOf(log.blockNumber),
        };
      }))),
      ...(await Promise.all(sponsorIncomeHelds.map(async (log) => {
        const packageId = Number((log as any).args.packageId);
        return {
          packageId,
          cyclePosition: Number((log as any).args.count) || 0,
          userAddress: lc((log as any).args.sponsor),
          directPartnerAddress: sponsorPurchaseByTxPkg.get(`${log.transactionHash}:${packageId}`) ?? "",
          totalReferralIncome: ((log as any).args.amount as bigint).toString(),
          isHeld: true,
          blockNumber: BigInt(log.blockNumber),
          txHash: log.transactionHash,
          logIndex: log.index,
          blockTimestamp: await timestampOf(log.blockNumber),
        };
      }))),
      ...(await Promise.all(sponsorReentries.map(async (log) => {
        const packageId = Number((log as any).args.packageId);
        return {
          packageId,
          cyclePosition: 5,
          userAddress: lc((log as any).args.sponsor),
          directPartnerAddress: sponsorPurchaseByTxPkg.get(`${log.transactionHash}:${packageId}`) ?? "",
          totalReferralIncome: "0",
          isHeld: false,
          blockNumber: BigInt(log.blockNumber),
          txHash: log.transactionHash,
          logIndex: log.index,
          blockTimestamp: await timestampOf(log.blockNumber),
        };
      }))),
    ]);

    const txRows: any[] = [];
    for (const log of registrations) {
      txRows.push({
        type: "REGISTRATION", walletAddress: lc((log as any).args.user), sponsorAddress: lc((log as any).args._sponsor),
        blockNumber: BigInt(log.blockNumber), txHash: log.transactionHash, logIndex: log.index, blockTimestamp: await timestampOf(log.blockNumber),
      });
    }
    for (const log of matrixIncomes) {
      const wallet = lc((log as any).args.receiver);
      txRows.push({
        type: "MATRIX_INCOME", walletAddress: wallet, sponsorAddress: sponsorMap.get(wallet) ?? null,
        counterpartyAddress: lc((log as any).args.from), packageId: Number((log as any).args.packageId),
        level: Number((log as any).args.level),
        amount: ((log as any).args.amount as bigint).toString(),
        blockNumber: BigInt(log.blockNumber), txHash: log.transactionHash, logIndex: log.index, blockTimestamp: await timestampOf(log.blockNumber),
      });
    }
    for (const log of directIncomes) {
      const wallet = lc((log as any).args.receiver);
      txRows.push({
        type: "DIRECT_INCOME", walletAddress: wallet, sponsorAddress: sponsorMap.get(wallet) ?? null,
        counterpartyAddress: lc((log as any).args.from), packageId: Number((log as any).args.packageId),
        cycle: (log as any).args.cycle as bigint, amount: ((log as any).args.amount as bigint).toString(),
        blockNumber: BigInt(log.blockNumber), txHash: log.transactionHash, logIndex: log.index, blockTimestamp: await timestampOf(log.blockNumber),
      });
    }
    for (const log of levelIncomes) {
      const wallet = lc((log as any).args.receiver);
      txRows.push({
        type: "LEVEL_INCOME", walletAddress: wallet, sponsorAddress: sponsorMap.get(wallet) ?? null,
        counterpartyAddress: lc((log as any).args.from), packageId: Number((log as any).args.packageId),
        level: Number((log as any).args.level),
        amount: ((log as any).args.amount as bigint).toString(),
        blockNumber: BigInt(log.blockNumber), txHash: log.transactionHash, logIndex: log.index, blockTimestamp: await timestampOf(log.blockNumber),
      });
    }
    for (const row of manualPurchaseRows) {
      txRows.push({
        type: "PACKAGE_PURCHASE", walletAddress: row.memberAddress, sponsorAddress: sponsorMap.get(row.memberAddress) ?? null,
        packageId: row.packageId, track: row.track, source: row.source, amount: row.amount,
        blockNumber: row.blockNumber, txHash: row.txHash, logIndex: row.logIndex, blockTimestamp: row.blockTimestamp,
      });
    }
    for (const row of autoUpgradeRows) {
      txRows.push({
        type: "PACKAGE_PURCHASE", walletAddress: row.memberAddress, sponsorAddress: sponsorMap.get(row.memberAddress) ?? null,
        packageId: row.packageId, track: row.track, source: row.source, amount: row.amount,
        blockNumber: row.blockNumber, txHash: row.txHash, logIndex: row.logIndex, blockTimestamp: row.blockTimestamp,
      });
    }
    for (const log of matrixPlacements) {
      const wallet = lc((log as any).args.user);
      txRows.push({
        type: "MATRIX_PLACEMENT", walletAddress: wallet, sponsorAddress: sponsorMap.get(wallet) ?? null,
        counterpartyAddress: lc((log as any).args.matrixParent), packageId: Number((log as any).args.packageId),
        blockNumber: BigInt(log.blockNumber), txHash: log.transactionHash, logIndex: log.index, blockTimestamp: await timestampOf(log.blockNumber),
      });
    }
    for (const log of level5Reentries) {
      const wallet = lc((log as any).args.user);
      txRows.push({
        type: "LEVEL5_REENTRY", walletAddress: wallet, sponsorAddress: sponsorMap.get(wallet) ?? null,
        counterpartyAddress: lc((log as any).args.phantomNode), packageId: Number((log as any).args.packageId),
        cycle: (log as any).args.cycleNumber as bigint,
        blockNumber: BigInt(log.blockNumber), txHash: log.transactionHash, logIndex: log.index, blockTimestamp: await timestampOf(log.blockNumber),
      });
    }
    for (const log of sponsorReentries) {
      const wallet = lc((log as any).args.sponsor);
      txRows.push({
        type: "SPONSOR_REENTRY", walletAddress: wallet, sponsorAddress: sponsorMap.get(wallet) ?? null,
        packageId: Number((log as any).args.packageId),
        blockNumber: BigInt(log.blockNumber), txHash: log.transactionHash, logIndex: log.index, blockTimestamp: await timestampOf(log.blockNumber),
      });
    }
    for (const log of matrixIncomeHelds) {
      const wallet = lc((log as any).args.user);
      txRows.push({
        type: "MATRIX_INCOME_HELD", walletAddress: wallet, sponsorAddress: sponsorMap.get(wallet) ?? null,
        packageId: Number((log as any).args.packageId), amount: ((log as any).args.amount as bigint).toString(),
        cycle: (log as any).args.memberCount as bigint,
        blockNumber: BigInt(log.blockNumber), txHash: log.transactionHash, logIndex: log.index, blockTimestamp: await timestampOf(log.blockNumber),
      });
    }
    for (const log of sponsorIncomeHelds) {
      const wallet = lc((log as any).args.sponsor);
      txRows.push({
        type: "SPONSOR_INCOME_HELD", walletAddress: wallet, sponsorAddress: sponsorMap.get(wallet) ?? null,
        packageId: Number((log as any).args.packageId), amount: ((log as any).args.amount as bigint).toString(),
        cycle: (log as any).args.count as bigint,
        blockNumber: BigInt(log.blockNumber), txHash: log.transactionHash, logIndex: log.index, blockTimestamp: await timestampOf(log.blockNumber),
      });
    }

    for (const log of incomeCappeds) {
      const wallet = lc((log as any).args.user);
      txRows.push({
        type: "INCOME_CAPPED", walletAddress: wallet, sponsorAddress: sponsorMap.get(wallet) ?? null,
        amount: ((log as any).args.redirectedToAdmin as bigint).toString(),
        blockNumber: BigInt(log.blockNumber), txHash: log.transactionHash, logIndex: log.index, blockTimestamp: await timestampOf(log.blockNumber),
      });
    }
    for (const log of sponsorIncomeRedirecteds) {
      const wallet = lc((log as any).args.wouldBeReceiver);
      txRows.push({
        type: "SPONSOR_INCOME_REDIRECTED", walletAddress: wallet, sponsorAddress: sponsorMap.get(wallet) ?? null,
        counterpartyAddress: lc((log as any).args.from), packageId: Number((log as any).args.packageId),
        track: "SPONSOR", amount: ((log as any).args.amount as bigint).toString(),
        blockNumber: BigInt(log.blockNumber), txHash: log.transactionHash, logIndex: log.index, blockTimestamp: await timestampOf(log.blockNumber),
      });
    }
    for (const log of levelIncomeRedirecteds) {
      const wallet = lc((log as any).args.wouldBeReceiver);
      txRows.push({
        type: "LEVEL_INCOME_REDIRECTED", walletAddress: wallet, sponsorAddress: sponsorMap.get(wallet) ?? null,
        counterpartyAddress: lc((log as any).args.from), packageId: Number((log as any).args.packageId),
        level: Number((log as any).args.level), track: "LEVEL", amount: ((log as any).args.amount as bigint).toString(),
        blockNumber: BigInt(log.blockNumber), txHash: log.transactionHash, logIndex: log.index, blockTimestamp: await timestampOf(log.blockNumber),
      });
    }

    if (txRows.length) {
      await tx.insert(schema.transactions).values(txRows).onConflictDoNothing();
    }

    await tx
      .update(schema.indexerState)
      .set({ lastProcessedBlock: toBlock })
      .where(eq(schema.indexerState.id, 1));
  });
}

export async function runIndexerLoop() {
  await seedRootAdmin(); // self-heals on every startup, survives a DB reset

  for (;;) {
    // A transient RPC error here (timeout, dropped connection, node hiccup)
    // must not take the whole process down — index.ts calls process.exit(1)
    // on this function ever throwing, which previously meant one flaky RPC
    // call killed the API too. Log and back off instead; the cursor already
    // only advances after a chunk fully commits, so nothing is lost by retrying.
    try {
      const lastProcessed = await getLastProcessedBlock();
      const head = BigInt(await provider.getBlockNumber());

      let from = lastProcessed + 1n;
      if (from > head) {
        await new Promise((r) => setTimeout(r, POLL_INTERVAL_MS));
        continue;
      }

      while (from <= head) {
        const to = from + LOG_BATCH_SIZE - 1n > head ? head : from + LOG_BATCH_SIZE - 1n;
        await processChunk(from, to);
        console.log(`indexer: processed blocks ${from}-${to}`);
        from = to + 1n;
      }
    } catch (err) {
      console.error("indexer: chunk failed, retrying after backoff:", err);
      await new Promise((r) => setTimeout(r, POLL_INTERVAL_MS));
    }
  }
}
