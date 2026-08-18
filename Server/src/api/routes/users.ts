import { Router } from "express";
import { and, eq, inArray, sql } from "drizzle-orm";
import { db, schema } from "../../db/client.js";
import { contract } from "../../chain/contract.js";

export const usersRouter = Router();

function isAddress(v: string) {
  return /^0x[0-9a-fA-F]{40}$/.test(v);
}

// NOTE: lowercase inline in every handler below, not via a shared .use()
// middleware — Express re-derives req.params fresh for each matching layer,
// so a middleware mutating req.params.address does NOT survive into a .get()
// handler with its own path pattern. Caused a real bug: mixed-case
// (checksummed, e.g. from ethers) addresses silently missed every DB row.

// Batch address->stringId lookup, DB-only (user_registrations). Replaces
// per-address live memberStringId RPC loops (e.g. resolving up to 62 matrix
// tree node addresses one call at a time) with a single query.
usersRouter.get("/string-ids", async (req, res) => {
  const raw = typeof req.query.addresses === "string" ? req.query.addresses : "";
  const addresses = raw.split(",").map((a) => a.trim().toLowerCase()).filter(isAddress);
  if (!addresses.length) return res.json({});

  const rows = await db.select({
    address: schema.userRegistrations.memberAddress,
    stringId: schema.userRegistrations.stringId,
  }).from(schema.userRegistrations)
    .where(inArray(schema.userRegistrations.memberAddress, addresses));

  res.json(Object.fromEntries(rows.map((r) => [r.address, r.stringId])));
});

// Live proxy — replaces deleted getUserProfile. sponsorStringId is one more
// live call (memberStringId on the sponsor address); userName is DB-only
// (user_details.userName — off-chain display name, see PUT /:address/name).
usersRouter.get("/:address/profile", async (req, res) => {
  const user = req.params.address.toLowerCase();
  if (!isAddress(user)) return res.status(400).json({ error: "invalid address" });
  const [stringId, numericId, sponsorAddr, totalDirects, joinDate, isActive, detailsRows] = await Promise.all([
    contract.memberStringId(user),
    contract.memberId(user),
    contract.sponsor(user),
    contract.referralCount(user),
    contract.activationDate(user),
    contract.topupFlag(user),
    db.select({ userName: schema.userDetails.userName }).from(schema.userDetails).where(eq(schema.userDetails.userAddress, user)),
  ]);
  const sponsorStringId = sponsorAddr && sponsorAddr !== "0x0000000000000000000000000000000000000000"
    ? await contract.memberStringId(sponsorAddr)
    : "";
  res.json({
    stringId,
    numericId: numericId.toString(),
    sponsor: sponsorAddr,
    sponsorStringId,
    totalDirects: totalDirects.toString(),
    joinDate: joinDate.toString(),
    isActive,
    userName: detailsRows[0]?.userName ?? null,
  });
});

// Off-chain display name — stored directly in user_details.userName, not
// on-chain (deliberately: no gas cost, no wallet signature just to set a
// cosmetic name). 1-32 chars, matches the on-chain setDisplayName length
// constraint for consistency even though this path doesn't touch the chain.
usersRouter.put("/:address/name", async (req, res) => {
  const user = req.params.address.toLowerCase();
  const name = typeof req.body?.name === "string" ? req.body.name.trim() : "";
  if (name.length < 1 || name.length > 32) {
    return res.status(400).json({ error: "INVALID_NAME_LENGTH" });
  }

  const result = await db.update(schema.userDetails)
    .set({ userName: name })
    .where(eq(schema.userDetails.userAddress, user))
    .returning({ userName: schema.userDetails.userName });

  if (!result.length) return res.status(404).json({ error: "NOT_INDEXED" });
  res.json({ userName: result[0].userName });
});

// Live proxy — replaces deleted getUserPackages.
usersRouter.get("/:address/packages", async (req, res) => {
  const user = req.params.address.toLowerCase();
  const [matrixPackageId, maxMatrixPackage, sponsorPackageId, maxSponsorPackage, levelPackageId, maxLevelPackage] =
    await Promise.all([
      contract.matrixPackageId(user),
      contract.maxMatrixPackage(user),
      contract.sponsorPackageId(user),
      contract.maxSponsorPackage(user),
      contract.levelPackageId(user),
      contract.maxLevelPackage(user),
    ]);
  res.json({
    matrix: { current: matrixPackageId, max: maxMatrixPackage },
    sponsor: { current: sponsorPackageId, max: maxSponsorPackage },
    level: { current: levelPackageId, max: maxLevelPackage },
  });
});

// Live proxy — replaces deleted getCycleAndHoldStatus.
usersRouter.get("/:address/cycle-hold/:packageId", async (req, res) => {
  const user = req.params.address.toLowerCase();
  const packageId = Number(req.params.packageId);
  const [matrixMembersFilled, matrixHoldAmount, sponsorMembersFilled, sponsorHoldAmount] = await Promise.all([
    contract.level5MemberCountByPkg(packageId, user),
    contract.matrixHoldByPkg(packageId, user),
    contract.sponsorCycleCountByPkg(packageId, user),
    contract.sponsorHoldByPkg(packageId, user),
  ]);
  res.json({
    matrixMembersFilled: matrixMembersFilled.toString(),
    matrixHoldAmount: matrixHoldAmount.toString(),
    sponsorMembersFilled: sponsorMembersFilled.toString(),
    sponsorHoldAmount: sponsorHoldAmount.toString(),
  });
});

// Replaces deleted directReferrals-array-getter-based version (the mapping
// itself was deleted from the contract, it was write-only dead weight — see
// [[contract_gas_strip]]). Direct children come from user_registrations
// (sponsor_address = this address); package ids are live (mutable, cheap
// single-slot reads); income/team-size are DB (indexer-maintained totals).
usersRouter.get("/:address/direct-partners", async (req, res) => {
  const user = req.params.address.toLowerCase();

  const registrations = await db.select({
    memberAddress: schema.userRegistrations.memberAddress,
    stringId: schema.userRegistrations.stringId,
    blockTimestamp: schema.userRegistrations.blockTimestamp,
  }).from(schema.userRegistrations)
    .where(eq(schema.userRegistrations.sponsorAddress, user))
    .orderBy(schema.userRegistrations.blockTimestamp);

  if (!registrations.length) return res.json([]);

  const addresses = registrations.map((r) => r.memberAddress);

  const [incomeRows, dashboardRows, packageRows] = await Promise.all([
    db.select({ walletAddress: schema.income.walletAddress, totalIncome: schema.income.totalIncome })
      .from(schema.income).where(inArray(schema.income.walletAddress, addresses)),
    db.select({ userAddress: schema.dashboard.userAddress, directPartners: schema.dashboard.directPartners })
      .from(schema.dashboard).where(inArray(schema.dashboard.userAddress, addresses)),
    Promise.all(addresses.map(async (addr) => ({
      address: addr,
      sponsorPackageId: Number(await contract.sponsorPackageId(addr)),
      matrixPackageId: Number(await contract.matrixPackageId(addr)),
      levelPackageId: Number(await contract.levelPackageId(addr)),
    }))),
  ]);

  const incomeByAddress = new Map(incomeRows.map((r) => [r.walletAddress, r.totalIncome]));
  const partnersByAddress = new Map(dashboardRows.map((r) => [r.userAddress, r.directPartners.toString()]));
  const packagesByAddress = new Map(packageRows.map((r) => [r.address, r]));

  res.json(registrations.map((r, i) => ({
    id: i + 1,
    date: r.blockTimestamp,
    wallet: r.memberAddress,
    stringId: r.stringId,
    sponsorPackageId: packagesByAddress.get(r.memberAddress)?.sponsorPackageId ?? 0,
    matrixPackageId: packagesByAddress.get(r.memberAddress)?.matrixPackageId ?? 0,
    levelPackageId: packagesByAddress.get(r.memberAddress)?.levelPackageId ?? 0,
    totalIncome: incomeByAddress.get(r.memberAddress) ?? "0",
    directPartners: partnersByAddress.get(r.memberAddress) ?? "0",
  })));
});

// Replaces deleted getUserPackageHistory / getUserHistoryByTrack.
usersRouter.get("/:address/history/packages", async (req, res) => {
  const user = req.params.address.toLowerCase();
  const track = typeof req.query.track === "string" ? req.query.track.toUpperCase() : undefined;
  const rows = await db.select().from(schema.packagePurchaseEvents).where(
    track
      ? and(eq(schema.packagePurchaseEvents.memberAddress, user), eq(schema.packagePurchaseEvents.track, track))
      : eq(schema.packagePurchaseEvents.memberAddress, user)
  ).orderBy(schema.packagePurchaseEvents.blockNumber, schema.packagePurchaseEvents.logIndex);
  res.json(rows);
});

// Replaces deleted getUserLevelIncomeHistory. fromStringId resolved
// server-side (LEFT JOIN user_registrations) so the UI doesn't need a
// separate address->stringId lookup per row.
usersRouter.get("/:address/history/level-income", async (req, res) => {
  const user = req.params.address.toLowerCase();
  const rows = await db.execute(sql`
    SELECT e.id, e.receiver, e.from_address, e.level, e.amount, e.block_timestamp,
           ur.string_id AS from_string_id
    FROM level_income_events e
    LEFT JOIN user_registrations ur ON ur.member_address = e.from_address
    WHERE e.receiver = ${user}
    ORDER BY e.block_number, e.log_index
  `);
  res.json(rows);
});

// Replaces deleted getUserReferralIncomeHistory.
usersRouter.get("/:address/history/direct-income", async (req, res) => {
  const user = req.params.address.toLowerCase();
  const rows = await db.execute(sql`
    SELECT e.id, e.receiver, e.from_address, e.package_id, e.cycle, e.amount, e.block_timestamp,
           ur.string_id AS from_string_id
    FROM direct_income_events e
    LEFT JOIN user_registrations ur ON ur.member_address = e.from_address
    WHERE e.receiver = ${user}
    ORDER BY e.block_number, e.log_index
  `);
  res.json(rows);
});

// Replaces deleted getUserMatrixIncomeHistory.
usersRouter.get("/:address/history/matrix-income", async (req, res) => {
  const user = req.params.address.toLowerCase();
  const rows = await db.execute(sql`
    SELECT e.id, e.receiver, e.from_address, e.level, e.amount, e.block_timestamp,
           ur.string_id AS from_string_id
    FROM matrix_income_events e
    LEFT JOIN user_registrations ur ON ur.member_address = e.from_address
    WHERE e.receiver = ${user}
    ORDER BY e.block_number, e.log_index
  `);
  res.json(rows);
});

// Replaces deleted getMatrixTreeInfo — parent/children rebuilt from MatrixPlaced events.
usersRouter.get("/:address/matrix-tree/:packageId", async (req, res) => {
  const user = req.params.address.toLowerCase();
  const packageId = Number(req.params.packageId);

  const [parentRow, children] = await Promise.all([
    db.select({ parentAddress: schema.matrixPlacements.parentAddress }).from(schema.matrixPlacements)
      .where(and(eq(schema.matrixPlacements.childAddress, user), eq(schema.matrixPlacements.packageId, packageId)))
      .limit(1),
    db.select({ childAddress: schema.matrixPlacements.childAddress }).from(schema.matrixPlacements)
      .where(and(eq(schema.matrixPlacements.parentAddress, user), eq(schema.matrixPlacements.packageId, packageId)))
      .orderBy(schema.matrixPlacements.blockNumber, schema.matrixPlacements.logIndex),
  ]);

  res.json({
    matrixParent: parentRow[0]?.parentAddress ?? null,
    directMatrixChildren: children.map((c) => c.childAddress),
  });
});

// MatrixIncome event carries no packageId (see contract_gas_strip notes), but
// every payout it emits happens inside the same transaction as the purchase
// that triggered it — so joining on tx_hash + buyer address recovers the
// packageId exactly (not a guess: one purchase tx = one buyer = one package).
usersRouter.get("/:address/matrix-income-total/:packageId", async (req, res) => {
  const user = req.params.address.toLowerCase();
  const packageId = Number(req.params.packageId);

  const rows = await db.execute(sql`
    SELECT COALESCE(SUM(mi.amount), 0) AS total
    FROM matrix_income_events mi
    JOIN package_purchase_events pp
      ON pp.tx_hash = mi.tx_hash
      AND pp.track = 'MATRIX'
      AND pp.member_address = mi.from_address
    WHERE mi.receiver = ${user} AND pp.package_id = ${packageId}
  `);

  res.json({ total: (rows[0] as any)?.total ?? "0" });
});

// Same tx_hash-join trick as matrix-income-total: LevelIncome carries no
// packageId either (its "level" field is sponsor-chain depth, not package
// tier), but every payout it emits happens inside the same transaction as
// the purchase that triggered the cascade.
usersRouter.get("/:address/level-income-total/:packageId", async (req, res) => {
  const user = req.params.address.toLowerCase();
  const packageId = Number(req.params.packageId);

  const rows = await db.execute(sql`
    SELECT COALESCE(SUM(li.amount), 0) AS total
    FROM level_income_events li
    JOIN package_purchase_events pp
      ON pp.tx_hash = li.tx_hash
      AND pp.track = 'LEVEL'
      AND pp.member_address = li.from_address
    WHERE li.receiver = ${user} AND pp.package_id = ${packageId}
  `);

  res.json({ total: (rows[0] as any)?.total ?? "0" });
});

// Replaces deleted getMagicGoldMatrixCycleCount + magicGoldMatrixStructure.
// Cycle root #0 is the user's own placement; every Level5ReEntry after that adds
// one more root (the phantom node), ordered by cycleNumber.
usersRouter.get("/:address/magic-gold/:packageId/cycles", async (req, res) => {
  const user = req.params.address.toLowerCase();
  const packageId = Number(req.params.packageId);
  const reentries = await db.select({ phantomNode: schema.level5Reentries.phantomNode })
    .from(schema.level5Reentries)
    .where(and(eq(schema.level5Reentries.userAddress, user), eq(schema.level5Reentries.packageId, packageId)))
    .orderBy(schema.level5Reentries.cycleNumber);
  res.json({ count: 1 + reentries.length, roots: [user, ...reentries.map((r) => r.phantomNode)] });
});

usersRouter.get("/:address/magic-gold/:packageId/:cycleIndex", async (req, res) => {
  const user = req.params.address.toLowerCase();
  const packageId = Number(req.params.packageId);
  const cycleIndex = Number(req.params.cycleIndex);

  let root: string;
  if (cycleIndex === 0) {
    root = user;
  } else {
    const reentries = await db.select({ phantomNode: schema.level5Reentries.phantomNode })
      .from(schema.level5Reentries)
      .where(and(eq(schema.level5Reentries.userAddress, user), eq(schema.level5Reentries.packageId, packageId)))
      .orderBy(schema.level5Reentries.cycleNumber);
    if (cycleIndex - 1 >= reentries.length) return res.status(400).json({ error: "BAD_CYCLE_INDEX" });
    root = reentries[cycleIndex - 1].phantomNode;
  }

  // 5-level, 2-children-per-node tree = 62 nodes total. Walk level by level.
  const nodes: (string | null)[] = new Array(62).fill(null);
  const levelStart = [0, 0, 2, 6, 14, 30];
  let currentLevelParents = [root];

  for (let lvl = 1; lvl <= 5; lvl++) {
    const start = levelStart[lvl];
    const rows = currentLevelParents.length
      ? await db.select({
          parentAddress: schema.matrixPlacements.parentAddress,
          childAddress: schema.matrixPlacements.childAddress,
        }).from(schema.matrixPlacements)
        .where(and(
          eq(schema.matrixPlacements.packageId, packageId),
          inArray(schema.matrixPlacements.parentAddress, currentLevelParents)
        ))
        .orderBy(schema.matrixPlacements.blockNumber, schema.matrixPlacements.logIndex)
      : [];

    const childrenByParent = new Map<string, string[]>();
    for (const row of rows) {
      const list = childrenByParent.get(row.parentAddress) ?? [];
      if (list.length < 2) list.push(row.childAddress);
      childrenByParent.set(row.parentAddress, list);
    }

    const nextLevelParents: string[] = [];
    currentLevelParents.forEach((parent, p) => {
      const kids = childrenByParent.get(parent) ?? [];
      kids.forEach((child, c) => {
        nodes[start + p * 2 + c] = child;
        nextLevelParents.push(child); // push, not indexed assign — a partly-filled
        // level (some parents with 1 child, some with 2) left gaps via
        // nextLevelParents[p*2+c], producing a sparse array; inArray() over a
        // sparse array desyncs drizzle's placeholder count from its params
        // and Postgres throws "syntax error at or near ','" on the next query.
      });
    });
    currentLevelParents = nextLevelParents.length ? nextLevelParents : new Array(Math.pow(2, lvl)).fill("");
  }

  res.json({ root, nodes });
});

// Same per-package computation as matrix-tree + magic-gold/cycles +
// magic-gold/:cycleIndex + matrix-income-total above, factored out so the
// summary route below can run it for all 9 tiers in one request instead of
// the frontend firing 4 requests x 9 packages (36+ calls, capped at ~6
// concurrent by the browser's per-origin connection limit no matter how much
// the frontend parallelizes with Promise.all).
async function computePackageMatrixSummary(user: string, packageId: number) {
  const [partnersCountRow, reentries, incomeRows] = await Promise.all([
    db.select({ count: sql<number>`count(*)::int` }).from(schema.matrixPlacements)
      .where(and(eq(schema.matrixPlacements.parentAddress, user), eq(schema.matrixPlacements.packageId, packageId))),
    db.select({ phantomNode: schema.level5Reentries.phantomNode })
      .from(schema.level5Reentries)
      .where(and(eq(schema.level5Reentries.userAddress, user), eq(schema.level5Reentries.packageId, packageId)))
      .orderBy(schema.level5Reentries.cycleNumber),
    db.execute(sql`
      SELECT COALESCE(SUM(mi.amount), 0) AS total
      FROM matrix_income_events mi
      JOIN package_purchase_events pp
        ON pp.tx_hash = mi.tx_hash
        AND pp.track = 'MATRIX'
        AND pp.member_address = mi.from_address
      WHERE mi.receiver = ${user} AND pp.package_id = ${packageId}
    `),
  ]);

  const roots = [user, ...reentries.map((r) => r.phantomNode)];
  const latestRoot = roots[roots.length - 1];

  const nodes: (string | null)[] = new Array(62).fill(null);
  const levelStart = [0, 0, 2, 6, 14, 30];
  let currentLevelParents = [latestRoot];

  for (let lvl = 1; lvl <= 5; lvl++) {
    const start = levelStart[lvl];
    const rows = currentLevelParents.length
      ? await db.select({
          parentAddress: schema.matrixPlacements.parentAddress,
          childAddress: schema.matrixPlacements.childAddress,
        }).from(schema.matrixPlacements)
        .where(and(
          eq(schema.matrixPlacements.packageId, packageId),
          inArray(schema.matrixPlacements.parentAddress, currentLevelParents)
        ))
        .orderBy(schema.matrixPlacements.blockNumber, schema.matrixPlacements.logIndex)
      : [];

    const childrenByParent = new Map<string, string[]>();
    for (const row of rows) {
      const list = childrenByParent.get(row.parentAddress) ?? [];
      if (list.length < 2) list.push(row.childAddress);
      childrenByParent.set(row.parentAddress, list);
    }

    const nextLevelParents: string[] = [];
    currentLevelParents.forEach((parent, p) => {
      const kids = childrenByParent.get(parent) ?? [];
      kids.forEach((child, c) => {
        nodes[start + p * 2 + c] = child;
        nextLevelParents.push(child); // see comment in the matrix-tree/:cycleIndex route above
      });
    });
    currentLevelParents = nextLevelParents.length ? nextLevelParents : new Array(Math.pow(2, lvl)).fill("");
  }

  return {
    packageId,
    partnersCount: partnersCountRow[0]?.count ?? 0,
    cycleCount: roots.length,
    nodes,
    revenue: String((incomeRows[0] as any)?.total ?? "0"),
  };
}

// Batches all 9 package tiers' matrix-tree/cycles/income into one request —
// see comment on computePackageMatrixSummary. Frontend still filters to
// packageId <= maxActivePkg (that boundary is a live contract read, not DB).
usersRouter.get("/:address/magic-gold-summary", async (req, res) => {
  const user = req.params.address.toLowerCase();
  if (!isAddress(user)) return res.status(400).json({ error: "invalid address" });

  const packages = await Promise.all(
    Array.from({ length: 9 }, (_, i) => i + 1).map((packageId) => computePackageMatrixSummary(user, packageId)),
  );

  res.json({ packages });
});
