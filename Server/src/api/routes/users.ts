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

// Sum of every package purchase (all 3 tracks, manual + auto) — replaces the
// on-chain userTotalInvestment as the "total invested" figure for ratio-type
// stats. userTotalInvestment only ever gets set once, at registration
// (package 1's price) — it's never touched by purchaseMatrixPackage/
// purchaseSponsorPackage/purchaseLevelPackage, so a member who's upgraded
// since registration shows income growing against a denominator frozen at
// their very first purchase (e.g. 260%+ "profit ratio").
usersRouter.get("/:address/total-invested", async (req, res) => {
  const user = req.params.address.toLowerCase();
  if (!isAddress(user))
    return res.status(400).json({ error: "invalid address" });

  const rows = await db.execute(sql`
    SELECT COALESCE(SUM(amount), 0) AS total
    FROM package_purchase_events
    WHERE member_address = ${user}
  `);

  res.json({ total: String((rows[0] as any)?.total ?? "0") });
});

// Batch address->stringId lookup, DB-only (user_registrations). Replaces
// per-address live memberStringId RPC loops (e.g. resolving up to 62 matrix
// tree node addresses one call at a time) with a single query.
usersRouter.get("/string-ids", async (req, res) => {
  const raw =
    typeof req.query.addresses === "string" ? req.query.addresses : "";
  const addresses = raw
    .split(",")
    .map((a) => a.trim().toLowerCase())
    .filter(isAddress);
  if (!addresses.length) return res.json({});

  const rows = await db
    .select({
      address: schema.userRegistrations.memberAddress,
      stringId: schema.userRegistrations.stringId,
    })
    .from(schema.userRegistrations)
    .where(inArray(schema.userRegistrations.memberAddress, addresses));

  res.json(Object.fromEntries(rows.map((r) => [r.address, r.stringId])));
});

// Live proxy — replaces deleted getUserProfile. sponsorStringId is one more
// live call (memberStringId on the sponsor address); userName is DB-only
// (user_details.userName — off-chain display name, see PUT /:address/name).
usersRouter.get("/:address/profile", async (req, res) => {
  const user = req.params.address.toLowerCase();
  if (!isAddress(user))
    return res.status(400).json({ error: "invalid address" });
  const [
    stringId,
    numericId,
    sponsorAddr,
    totalDirects,
    joinDate,
    isActive,
    detailsRows,
  ] = await Promise.all([
    contract.memberStringId(user),
    contract.memberId(user),
    contract.sponsor(user),
    contract.referralCount(user),
    contract.activationDate(user),
    contract.topupFlag(user),
    db
      .select({ userName: schema.userDetails.userName })
      .from(schema.userDetails)
      .where(eq(schema.userDetails.userAddress, user)),
  ]);
  const sponsorStringId =
    sponsorAddr && sponsorAddr !== "0x0000000000000000000000000000000000000000"
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

  const result = await db
    .update(schema.userDetails)
    .set({ userName: name })
    .where(eq(schema.userDetails.userAddress, user))
    .returning({ userName: schema.userDetails.userName });

  if (!result.length) return res.status(404).json({ error: "NOT_INDEXED" });
  res.json({ userName: result[0].userName });
});

// Live proxy — replaces deleted getUserPackages.
usersRouter.get("/:address/packages", async (req, res) => {
  const user = req.params.address.toLowerCase();
  const [
    matrixPackageId,
    maxMatrixPackage,
    sponsorPackageId,
    maxSponsorPackage,
    levelPackageId,
    maxLevelPackage,
  ] = await Promise.all([
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
  const [
    matrixMembersFilled,
    matrixHoldAmount,
    sponsorMembersFilled,
    sponsorHoldAmount,
  ] = await Promise.all([
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

  const registrations = await db
    .select({
      memberAddress: schema.userRegistrations.memberAddress,
      stringId: schema.userRegistrations.stringId,
      blockTimestamp: schema.userRegistrations.blockTimestamp,
    })
    .from(schema.userRegistrations)
    .where(eq(schema.userRegistrations.sponsorAddress, user))
    .orderBy(schema.userRegistrations.blockTimestamp);

  if (!registrations.length) return res.json([]);

  const addresses = registrations.map((r) => r.memberAddress);

  const [incomeRows, dashboardRows, packageRows] = await Promise.all([
    db
      .select({
        walletAddress: schema.income.walletAddress,
        totalIncome: schema.income.totalIncome,
      })
      .from(schema.income)
      .where(inArray(schema.income.walletAddress, addresses)),
    db
      .select({
        userAddress: schema.dashboard.userAddress,
        directPartners: schema.dashboard.directPartners,
      })
      .from(schema.dashboard)
      .where(inArray(schema.dashboard.userAddress, addresses)),
    Promise.all(
      addresses.map(async (addr) => ({
        address: addr,
        sponsorPackageId: Number(await contract.sponsorPackageId(addr)),
        matrixPackageId: Number(await contract.matrixPackageId(addr)),
        levelPackageId: Number(await contract.levelPackageId(addr)),
      })),
    ),
  ]);

  const incomeByAddress = new Map(
    incomeRows.map((r) => [r.walletAddress, r.totalIncome]),
  );
  const partnersByAddress = new Map(
    dashboardRows.map((r) => [r.userAddress, r.directPartners.toString()]),
  );
  const packagesByAddress = new Map(packageRows.map((r) => [r.address, r]));

  res.json(
    registrations.map((r, i) => ({
      id: i + 1,
      date: r.blockTimestamp,
      wallet: r.memberAddress,
      stringId: r.stringId,
      sponsorPackageId:
        packagesByAddress.get(r.memberAddress)?.sponsorPackageId ?? 0,
      matrixPackageId:
        packagesByAddress.get(r.memberAddress)?.matrixPackageId ?? 0,
      levelPackageId:
        packagesByAddress.get(r.memberAddress)?.levelPackageId ?? 0,
      totalIncome: incomeByAddress.get(r.memberAddress) ?? "0",
      directPartners: partnersByAddress.get(r.memberAddress) ?? "0",
    })),
  );
});

// Replaces deleted getUserPackageHistory / getUserHistoryByTrack.
usersRouter.get("/:address/history/packages", async (req, res) => {
  const user = req.params.address.toLowerCase();
  const track =
    typeof req.query.track === "string"
      ? req.query.track.toUpperCase()
      : undefined;
  const rows = await db
    .select()
    .from(schema.packagePurchaseEvents)
    .where(
      track
        ? and(
            eq(schema.packagePurchaseEvents.memberAddress, user),
            eq(schema.packagePurchaseEvents.track, track),
          )
        : eq(schema.packagePurchaseEvents.memberAddress, user),
    )
    .orderBy(
      schema.packagePurchaseEvents.blockNumber,
      schema.packagePurchaseEvents.logIndex,
    );
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

// Real per-package recycle counts for the Sponsor Magic overview grid — one
// row per SponsorReEntry event, grouped. The overview page used to derive
// this from DirectIncome's own `cycle` field (1..4, the within-batch
// position of a paid referral), which isn't a recycle count at all: with 2
// partners it showed "2 cycles" when zero recycles had happened. A recycle
// only actually occurs on SponsorReEntry (count==5), which pays the
// sponsor's OWN upline, not the sponsor — so it never appears in the
// sponsor's own DirectIncome feed to begin with.
usersRouter.get("/:address/sponsor-recycle-counts", async (req, res) => {
  const user = req.params.address.toLowerCase();
  if (!isAddress(user))
    return res.status(400).json({ error: "invalid address" });

  const rows = await db.execute(sql`
    SELECT package_id, count(*)::int AS count
    FROM transactions
    WHERE type = 'SPONSOR_REENTRY' AND wallet_address = ${user}
    GROUP BY package_id
  `);

  const counts: Record<number, number> = {};
  for (const r of rows as any[]) counts[r.package_id] = r.count;
  res.json({ counts });
});

// Batched version of /history/sponsor-held/:packageId for the Sponsor Magic
// overview grid — all 9 tiers' held-partner ids in one query instead of 9
// requests. Same tx_hash join, grouped by package_id. Overview grid's
// partnersCount/slots were built from DirectIncome only (paid referrals #1/#2
// and any #3/#4 that already got paid), same held-partner blind spot already
// fixed on the per-level detail page — a sponsor with 4 real partners was
// showing only 2 dots here too.
usersRouter.get("/:address/sponsor-held-summary", async (req, res) => {
  const user = req.params.address.toLowerCase();
  if (!isAddress(user))
    return res.status(400).json({ error: "invalid address" });

  const rows = await db.execute(sql`
    SELECT held.package_id, ur.string_id AS from_string_id
    FROM transactions held
    JOIN transactions buyer
      ON buyer.tx_hash = held.tx_hash
      AND buyer.type = 'PACKAGE_PURCHASE'
      AND buyer.track = 'SPONSOR'
      AND buyer.package_id = held.package_id
    LEFT JOIN user_registrations ur ON ur.member_address = buyer.wallet_address
    WHERE held.type = 'SPONSOR_INCOME_HELD' AND held.wallet_address = ${user}
    ORDER BY held.block_number, held.log_index
  `);

  const byPackage: Record<number, string[]> = {};
  for (const r of rows as any[]) {
    (byPackage[r.package_id] ??= []).push(r.from_string_id ?? "ID ...");
  }
  res.json({ byPackage });
});

// SponsorIncomeHeld (count 3/4, pre-upgrade) carries no buyer address on-chain
// — event SponsorIncomeHeld(sponsor, packageId, amount, count) — unlike
// DirectIncome which carries `from`. So the frontend's cyclePartnerIds (built
// from /transactions?type=DIRECT_INCOME) silently drops partners #3/#4
// whenever their income lands in the hold branch instead of getting paid out:
// a sponsor with 4 real direct partners would only show 2 slots. Recover the
// buyer the same way matrix-income-total does — join on tx_hash against the
// PACKAGE_PURCHASE(SPONSOR) row from the SAME transaction (every purchase
// that can trigger a hold, registration included, always emits one).
usersRouter.get(
  "/:address/history/sponsor-held/:packageId",
  async (req, res) => {
    const user = req.params.address.toLowerCase();
    const packageId = Number(req.params.packageId);

    const rows = await db.execute(sql`
    SELECT held.id, held.wallet_address AS receiver, buyer.wallet_address AS from_address,
           held.package_id, held.cycle, held.amount, held.block_timestamp,
           ur.string_id AS from_string_id
    FROM transactions held
    JOIN transactions buyer
      ON buyer.tx_hash = held.tx_hash
      AND buyer.type = 'PACKAGE_PURCHASE'
      AND buyer.track = 'SPONSOR'
      AND buyer.package_id = held.package_id
    LEFT JOIN user_registrations ur ON ur.member_address = buyer.wallet_address
    WHERE held.type = 'SPONSOR_INCOME_HELD' AND held.wallet_address = ${user} AND held.package_id = ${packageId}
    ORDER BY held.block_number, held.log_index
  `);

    res.json(rows);
  },
);

// Replaces deleted getUserMatrixIncomeHistory.
// usersRouter.get("/:address/history/matrix-income", async (req, res) => {
//   const user = req.params.address.toLowerCase();
//   const rows = await db.execute(sql`
//     SELECT e.id, e.receiver, e.from_address, e.level, e.amount, e.block_timestamp,
//            ur.string_id AS from_string_id
//     FROM matrix_income_events e
//     LEFT JOIN user_registrations ur ON ur.member_address = e.from_address
//     WHERE e.receiver = ${user}
//     ORDER BY e.block_number, e.log_index
//   `);
//   res.json(rows);
// });

usersRouter.get("/:address/history/matrix-income", async (req, res) => {
  const user = req.params.address.toLowerCase();
  const rows = await db.execute(sql`
    SELECT e.id, e.receiver, e.from_address, e.level, e.amount, e.block_timestamp,
           ur.string_id AS from_string_id,
           pp.package_id AS package_id
    FROM matrix_income_events e
    LEFT JOIN user_registrations ur ON ur.member_address = e.from_address
    LEFT JOIN package_purchase_events pp
      ON pp.tx_hash = e.tx_hash
      AND pp.track = 'MATRIX'
      AND pp.member_address = e.from_address
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
    db
      .select({ parentAddress: schema.matrixPlacements.parentAddress })
      .from(schema.matrixPlacements)
      .where(
        and(
          eq(schema.matrixPlacements.childAddress, user),
          eq(schema.matrixPlacements.packageId, packageId),
        ),
      )
      .limit(1),
    db
      .select({ childAddress: schema.matrixPlacements.childAddress })
      .from(schema.matrixPlacements)
      .where(
        and(
          eq(schema.matrixPlacements.parentAddress, user),
          eq(schema.matrixPlacements.packageId, packageId),
        ),
      )
      .orderBy(
        schema.matrixPlacements.blockNumber,
        schema.matrixPlacements.logIndex,
      ),
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
usersRouter.get(
  "/:address/matrix-income-total/:packageId",
  async (req, res) => {
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
  },
);

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
  const reentries = await db
    .select({ phantomNode: schema.level5Reentries.phantomNode })
    .from(schema.level5Reentries)
    .where(
      and(
        eq(schema.level5Reentries.userAddress, user),
        eq(schema.level5Reentries.packageId, packageId),
      ),
    )
    .orderBy(schema.level5Reentries.cycleNumber);
  res.json({
    count: 1 + reentries.length,
    roots: [user, ...reentries.map((r) => r.phantomNode)],
  });
});

// usersRouter.get(
//   "/:address/magic-gold/:packageId/:cycleIndex",
//   async (req, res) => {
//     const user = req.params.address.toLowerCase();
//     const packageId = Number(req.params.packageId);
//     const cycleIndex = Number(req.params.cycleIndex);

//     let root: string;
//     if (cycleIndex === 0) {
//       root = user;
//     } else {
//       const reentries = await db
//         .select({ phantomNode: schema.level5Reentries.phantomNode })
//         .from(schema.level5Reentries)
//         .where(
//           and(
//             eq(schema.level5Reentries.userAddress, user),
//             eq(schema.level5Reentries.packageId, packageId),
//           ),
//         )
//         .orderBy(schema.level5Reentries.cycleNumber);
//       if (cycleIndex - 1 >= reentries.length)
//         return res.status(400).json({ error: "BAD_CYCLE_INDEX" });
//       root = reentries[cycleIndex - 1].phantomNode;
//     }

//     // 5-level, 2-children-per-node tree = 62 nodes total. Walk level by level.
//     const nodes: (string | null)[] = new Array(62).fill(null);
//     const levelStart = [0, 0, 2, 6, 14, 30];
//     let currentLevelParents = [root];

//     for (let lvl = 1; lvl <= 5; lvl++) {
//       const start = levelStart[lvl];
//       const rows = currentLevelParents.length
//         ? await db
//             .select({
//               parentAddress: schema.matrixPlacements.parentAddress,
//               childAddress: schema.matrixPlacements.childAddress,
//             })
//             .from(schema.matrixPlacements)
//             .where(
//               and(
//                 eq(schema.matrixPlacements.packageId, packageId),
//                 inArray(
//                   schema.matrixPlacements.parentAddress,
//                   currentLevelParents,
//                 ),
//               ),
//             )
//             .orderBy(
//               schema.matrixPlacements.blockNumber,
//               schema.matrixPlacements.logIndex,
//             )
//         : [];

//       const childrenByParent = new Map<string, string[]>();
//       for (const row of rows) {
//         const list = childrenByParent.get(row.parentAddress) ?? [];
//         if (list.length < 2) list.push(row.childAddress);
//         childrenByParent.set(row.parentAddress, list);
//       }

//       const nextLevelParents: string[] = [];
//       currentLevelParents.forEach((parent, p) => {
//         const kids = childrenByParent.get(parent) ?? [];
//         kids.forEach((child, c) => {
//           nodes[start + p * 2 + c] = child;
//           nextLevelParents.push(child);
//         });
//       });
//       currentLevelParents = nextLevelParents.length
//         ? nextLevelParents
//         : new Array(Math.pow(2, lvl)).fill("");
//     }

//     res.json({ root, nodes });
//   },
// );


usersRouter.get(
  "/:address/magic-gold/:packageId/:cycleIndex",
  async (req, res) => {
    const user = req.params.address.toLowerCase();
    const packageId = Number(req.params.packageId);
    const cycleIndex = Number(req.params.cycleIndex);

    let root: string;
    if (cycleIndex === 0) {
      root = user;
    } else {
      const reentries = await db
        .select({ phantomNode: schema.level5Reentries.phantomNode })
        .from(schema.level5Reentries)
        .where(
          and(
            eq(schema.level5Reentries.userAddress, user),
            eq(schema.level5Reentries.packageId, packageId),
          ),
        )
        .orderBy(schema.level5Reentries.cycleNumber);
      if (cycleIndex - 1 >= reentries.length)
        return res.status(400).json({ error: "BAD_CYCLE_INDEX" });
      root = reentries[cycleIndex - 1].phantomNode;
    }

    // 5-level, 2-children-per-node tree = 62 nodes total. Walk level by level.
    type MatrixNodeInfo = { address: string; isDirectPlacement: boolean; isInDownline: boolean } | null;
    const nodes: MatrixNodeInfo[] = new Array(62).fill(null);
    const levelStart = [0, 0, 2, 6, 14, 30];
    let currentLevelParents = [root];

    // Track filled slots during the walk so we can batch the downline check
    // afterward instead of querying per node.
    const filledSlots: { index: number; address: string; sponsorAddress: string; parentAddress: string }[] = [];

    for (let lvl = 1; lvl <= 5; lvl++) {
      const start = levelStart[lvl];
      const rows = currentLevelParents.length
        ? await db
            .select({
              parentAddress: schema.matrixPlacements.parentAddress,
              childAddress: schema.matrixPlacements.childAddress,
              sponsorAddress: schema.matrixPlacements.sponsorAddress,
            })
            .from(schema.matrixPlacements)
            .where(
              and(
                eq(schema.matrixPlacements.packageId, packageId),
                inArray(
                  schema.matrixPlacements.parentAddress,
                  currentLevelParents,
                ),
              ),
            )
            .orderBy(
              schema.matrixPlacements.blockNumber,
              schema.matrixPlacements.logIndex,
            )
        : [];

      const childrenByParent = new Map<string, typeof rows>();
      for (const row of rows) {
        const list = childrenByParent.get(row.parentAddress) ?? [];
        if (list.length < 2) list.push(row);
        childrenByParent.set(row.parentAddress, list);
      }

      const nextLevelParents: string[] = [];
      currentLevelParents.forEach((parent, p) => {
        const kids = childrenByParent.get(parent) ?? [];
        kids.forEach((row, c) => {
          const index = start + p * 2 + c;
          filledSlots.push({
            index,
            address: row.childAddress,
            sponsorAddress: row.sponsorAddress,
            parentAddress: row.parentAddress,
          });
          nextLevelParents.push(row.childAddress);
        });
      });
      currentLevelParents = nextLevelParents.length
        ? nextLevelParents
        : new Array(Math.pow(2, lvl)).fill("");
    }

    const downlineSet = await getDownlineMembership(user, filledSlots.map((s) => s.address));

    for (const slot of filledSlots) {
      nodes[slot.index] = {
        address: slot.address,
        isDirectPlacement: slot.sponsorAddress.toLowerCase() === slot.parentAddress.toLowerCase(),
        isInDownline: downlineSet.has(slot.address),
      };
    }

    res.json({ root, nodes });
  },
);

// Same per-package computation as matrix-tree + magic-gold/cycles +
// magic-gold/:cycleIndex + matrix-income-total above, factored out so the
// summary route below can run it for all 9 tiers in one request instead of
// the frontend firing 4 requests x 9 packages (36+ calls, capped at ~6
// concurrent by the browser's per-origin connection limit no matter how much
// the frontend parallelizes with Promise.all).
// async function computePackageMatrixSummary(user: string, packageId: number) {
//   const [partnersCountRow, reentries, incomeRows] = await Promise.all([
//     db.select({ count: sql<number>`count(*)::int` }).from(schema.matrixPlacements)
//       .where(and(eq(schema.matrixPlacements.parentAddress, user), eq(schema.matrixPlacements.packageId, packageId))),
//     db.select({ phantomNode: schema.level5Reentries.phantomNode })
//       .from(schema.level5Reentries)
//       .where(and(eq(schema.level5Reentries.userAddress, user), eq(schema.level5Reentries.packageId, packageId)))
//       .orderBy(schema.level5Reentries.cycleNumber),
//     db.execute(sql`
//       SELECT COALESCE(SUM(mi.amount), 0) AS total
//       FROM matrix_income_events mi
//       JOIN package_purchase_events pp
//         ON pp.tx_hash = mi.tx_hash
//         AND pp.track = 'MATRIX'
//         AND pp.member_address = mi.from_address
//       WHERE mi.receiver = ${user} AND pp.package_id = ${packageId}
//     `),
//   ]);

//   const roots = [user, ...reentries.map((r) => r.phantomNode)];
//   const latestRoot = roots[roots.length - 1];

//   const nodes: (string | null)[] = new Array(62).fill(null);
//   const levelStart = [0, 0, 2, 6, 14, 30];
//   let currentLevelParents = [latestRoot];

//   for (let lvl = 1; lvl <= 5; lvl++) {
//     const start = levelStart[lvl];
//     const rows = currentLevelParents.length
//       ? await db.select({
//           parentAddress: schema.matrixPlacements.parentAddress,
//           childAddress: schema.matrixPlacements.childAddress,
//         }).from(schema.matrixPlacements)
//         .where(and(
//           eq(schema.matrixPlacements.packageId, packageId),
//           inArray(schema.matrixPlacements.parentAddress, currentLevelParents)
//         ))
//         .orderBy(schema.matrixPlacements.blockNumber, schema.matrixPlacements.logIndex)
//       : [];

//     const childrenByParent = new Map<string, string[]>();
//     for (const row of rows) {
//       const list = childrenByParent.get(row.parentAddress) ?? [];
//       if (list.length < 2) list.push(row.childAddress);
//       childrenByParent.set(row.parentAddress, list);
//     }

//     const nextLevelParents: string[] = [];
//     currentLevelParents.forEach((parent, p) => {
//       const kids = childrenByParent.get(parent) ?? [];
//       kids.forEach((child, c) => {
//         nodes[start + p * 2 + c] = child;
//         nextLevelParents.push(child); // see comment in the matrix-tree/:cycleIndex route above
//       });
//     });
//     currentLevelParents = nextLevelParents.length ? nextLevelParents : new Array(Math.pow(2, lvl)).fill("");
//   }

//   return {
//     packageId,
//     partnersCount: partnersCountRow[0]?.count ?? 0,
//     cycleCount: roots.length,
//     nodes,
//     revenue: String((incomeRows[0] as any)?.total ?? "0"),
//   };
// }

type MatrixNode = {
  address: string;
  isDirectPlacement: boolean;
  isInDownline: boolean;
} | null;

// Given a root user and a batch of candidate addresses, returns the subset
// that are within the root's referral downline — walking each candidate's
// sponsor chain, if it ever reaches the root as a sponsor, they're "in
// downline". Used to tell "spillover from your own team" (yellow) apart
// from "spillover from outside/upline" (orange).
async function getDownlineMembership(
  rootUser: string,
  addresses: string[],
): Promise<Set<string>> {
  const candidates = Array.from(new Set(addresses.filter(Boolean)));
  if (candidates.length === 0) return new Set();

  // Build an explicit ARRAY[...] literal instead of binding a JS array as a
  // single parameter — drizzle's sql tag doesn't reliably serialize JS
  // arrays into Postgres array params (fails/mis-serializes for small
  // arrays, e.g. length 1), causing "malformed array literal" errors.
  const candidatesArray = sql.join(
    candidates.map((c) => sql`${c}`),
    sql`, `,
  );

  const rows = await db.execute(sql`
    WITH RECURSIVE ancestry AS (
      SELECT member_address AS origin, sponsor_address, 1 AS depth
      FROM user_registrations
      WHERE member_address = ANY(ARRAY[${candidatesArray}]::text[])
      UNION ALL
      SELECT a.origin, ur.sponsor_address, a.depth + 1
      FROM user_registrations ur
      JOIN ancestry a ON ur.member_address = a.sponsor_address
      WHERE a.depth < 50 AND a.sponsor_address != ${rootUser}
    )
    SELECT DISTINCT origin
    FROM ancestry
    WHERE sponsor_address = ${rootUser}
  `);

  return new Set(rows.map((r: any) => r.origin as string));
}

async function computePackageMatrixSummary(user: string, packageId: number) {
  const [partnersCountRow, reentries, incomeRows, level5CountRaw] =
    await Promise.all([
      db
        .select({ count: sql<number>`count(*)::int` })
        .from(schema.matrixPlacements)
        .where(
          and(
            eq(schema.matrixPlacements.parentAddress, user),
            eq(schema.matrixPlacements.packageId, packageId),
          ),
        ),
      db
        .select({ phantomNode: schema.level5Reentries.phantomNode })
        .from(schema.level5Reentries)
        .where(
          and(
            eq(schema.level5Reentries.userAddress, user),
            eq(schema.level5Reentries.packageId, packageId),
          ),
        )
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
      contract.level5MemberCountByPkg(packageId, user).catch(() => 0n),
    ]);

  const roots = [user, ...reentries.map((r) => r.phantomNode)];
  const latestRoot = roots[roots.length - 1];

  const nodes: MatrixNode[] = new Array(62).fill(null);
  const levelStart = [0, 0, 2, 6, 14, 30];
  let currentLevelParents = [latestRoot];

  // Track filled slots during the walk so we can batch the downline check
  // afterward instead of querying per node.
  const filledSlots: {
    index: number;
    address: string;
    sponsorAddress: string;
    parentAddress: string;
  }[] = [];

  for (let lvl = 1; lvl <= 5; lvl++) {
    const start = levelStart[lvl];
    const rows = currentLevelParents.length
      ? await db
          .select({
            parentAddress: schema.matrixPlacements.parentAddress,
            childAddress: schema.matrixPlacements.childAddress,
            sponsorAddress: schema.matrixPlacements.sponsorAddress,
          })
          .from(schema.matrixPlacements)
          .where(
            and(
              eq(schema.matrixPlacements.packageId, packageId),
              inArray(
                schema.matrixPlacements.parentAddress,
                currentLevelParents,
              ),
            ),
          )
          .orderBy(
            schema.matrixPlacements.blockNumber,
            schema.matrixPlacements.logIndex,
          )
      : [];

    const childrenByParent = new Map<string, typeof rows>();
    for (const row of rows) {
      const list = childrenByParent.get(row.parentAddress) ?? [];
      if (list.length < 2) list.push(row);
      childrenByParent.set(row.parentAddress, list);
    }

    const nextLevelParents: string[] = [];
    currentLevelParents.forEach((parent, p) => {
      const kids = childrenByParent.get(parent) ?? [];
      kids.forEach((row, c) => {
        const index = start + p * 2 + c;
        filledSlots.push({
          index,
          address: row.childAddress,
          sponsorAddress: row.sponsorAddress,
          parentAddress: row.parentAddress,
        });
        nextLevelParents.push(row.childAddress); // see comment in the matrix-tree/:cycleIndex route above
      });
    });
    currentLevelParents = nextLevelParents.length
      ? nextLevelParents
      : new Array(Math.pow(2, lvl)).fill("");
  }

  const downlineSet = await getDownlineMembership(
    user,
    filledSlots.map((s) => s.address),
  );

  for (const slot of filledSlots) {
    nodes[slot.index] = {
      address: slot.address,
      isDirectPlacement: slot.sponsorAddress === slot.parentAddress,
      isInDownline: downlineSet.has(slot.address),
    };
  }

  const visibleFilledCount = nodes
    .slice(0, 30)
    .filter((n) => n !== null).length;

  return {
    packageId,
    partnersCount: visibleFilledCount || (partnersCountRow[0]?.count ?? 0),
    level5Count: Number(level5CountRaw),
    cycleCount: roots.length,
    nodes,
    revenue: String((incomeRows[0] as any)?.total ?? "0"),
  };
}

// type MatrixNode = { address: string; isDirectPlacement: boolean } | null;

// async function computePackageMatrixSummary(user: string, packageId: number) {
//   const [partnersCountRow, reentries, incomeRows, level5CountRaw] =
//     await Promise.all([
//       db
//         .select({ count: sql<number>`count(*)::int` })
//         .from(schema.matrixPlacements)
//         .where(
//           and(
//             eq(schema.matrixPlacements.parentAddress, user),
//             eq(schema.matrixPlacements.packageId, packageId),
//           ),
//         ),
//       db
//         .select({ phantomNode: schema.level5Reentries.phantomNode })
//         .from(schema.level5Reentries)
//         .where(
//           and(
//             eq(schema.level5Reentries.userAddress, user),
//             eq(schema.level5Reentries.packageId, packageId),
//           ),
//         )
//         .orderBy(schema.level5Reentries.cycleNumber),
//       db.execute(sql`
//       SELECT COALESCE(SUM(mi.amount), 0) AS total
//       FROM matrix_income_events mi
//       JOIN package_purchase_events pp
//         ON pp.tx_hash = mi.tx_hash
//         AND pp.track = 'MATRIX'
//         AND pp.member_address = mi.from_address
//       WHERE mi.receiver = ${user} AND pp.package_id = ${packageId}
//     `),
//       contract.level5MemberCountByPkg(packageId, user).catch(() => 0n),
//     ]);

//   const roots = [user, ...reentries.map((r) => r.phantomNode)];
//   const latestRoot = roots[roots.length - 1];

//   const nodes: MatrixNode[] = new Array(62).fill(null);
//   const levelStart = [0, 0, 2, 6, 14, 30];
//   let currentLevelParents = [latestRoot];

//   for (let lvl = 1; lvl <= 5; lvl++) {
//     const start = levelStart[lvl];
//     const rows = currentLevelParents.length
//       ? await db
//           .select({
//             parentAddress: schema.matrixPlacements.parentAddress,
//             childAddress: schema.matrixPlacements.childAddress,
//             sponsorAddress: schema.matrixPlacements.sponsorAddress,
//           })
//           .from(schema.matrixPlacements)
//           .where(
//             and(
//               eq(schema.matrixPlacements.packageId, packageId),
//               inArray(
//                 schema.matrixPlacements.parentAddress,
//                 currentLevelParents,
//               ),
//             ),
//           )
//           .orderBy(
//             schema.matrixPlacements.blockNumber,
//             schema.matrixPlacements.logIndex,
//           )
//       : [];

//     const childrenByParent = new Map<string, typeof rows>();
//     for (const row of rows) {
//       const list = childrenByParent.get(row.parentAddress) ?? [];
//       if (list.length < 2) list.push(row);
//       childrenByParent.set(row.parentAddress, list);
//     }

//     const nextLevelParents: string[] = [];
//     currentLevelParents.forEach((parent, p) => {
//       const kids = childrenByParent.get(parent) ?? [];
//       kids.forEach((row, c) => {
//         nodes[start + p * 2 + c] = {
//           address: row.childAddress,
//           isDirectPlacement: row.sponsorAddress === row.parentAddress,
//         };
//         nextLevelParents.push(row.childAddress); // see comment in the matrix-tree/:cycleIndex route above
//       });
//     });
//     currentLevelParents = nextLevelParents.length
//       ? nextLevelParents
//       : new Array(Math.pow(2, lvl)).fill("");
//   }

//   const visibleFilledCount = nodes
//     .slice(0, 30)
//     .filter((n) => n !== null).length;

//   return {
//     packageId,
//     partnersCount: visibleFilledCount || (partnersCountRow[0]?.count ?? 0),
//     level5Count: Number(level5CountRaw),
//     cycleCount: roots.length,
//     nodes,
//     revenue: String((incomeRows[0] as any)?.total ?? "0"),
//   };

//   // return {
//   //   packageId,
//   //   partnersCount: partnersCountRow[0]?.count ?? 0,
//   //   level5Count: Number(level5CountRaw),
//   //   cycleCount: roots.length,
//   //   nodes,
//   //   revenue: String((incomeRows[0] as any)?.total ?? "0"),
//   // };
// }

// Batches all 9 package tiers' matrix-tree/cycles/income into one request —
// see comment on computePackageMatrixSummary. Frontend still filters to
// packageId <= maxActivePkg (that boundary is a live contract read, not DB).
usersRouter.get("/:address/magic-gold-summary", async (req, res) => {
  const user = req.params.address.toLowerCase();
  if (!isAddress(user))
    return res.status(400).json({ error: "invalid address" });

  const packages = await Promise.all(
    Array.from({ length: 9 }, (_, i) => i + 1).map((packageId) =>
      computePackageMatrixSummary(user, packageId),
    ),
  );

  res.json({ packages });
});
