import { Router } from "express";
import { and, eq, sql } from "drizzle-orm";
import { db, schema } from "../../db/client.js";
import { contract } from "../../chain/contract.js";

export const teamRouter = Router();

// Replaces deleted getTeamByLevel — now a direct read of the indexer-maintained
// total_members_by_level table instead of a live recursive CTE.
teamRouter.get("/:address/level/:level", async (req, res) => {
  const address = req.params.address.toLowerCase();
  const level = Number(req.params.level);

  const rows = await db.select({ totalCount: schema.totalMembersByLevel.totalCount })
    .from(schema.totalMembersByLevel)
    .where(and(eq(schema.totalMembersByLevel.userAddress, address), eq(schema.totalMembersByLevel.levelId, level)));

  res.json({ level, count: rows[0]?.totalCount?.toString() ?? "0" });
});

// Same table, all levels in one query — replaces the old pattern of calling
// deleted getTeamByLevel once per level (was 7 separate calls for the rank
// overview card).
teamRouter.get("/:address/levels", async (req, res) => {
  const address = req.params.address.toLowerCase();

  const rows = await db.select({ levelId: schema.totalMembersByLevel.levelId, totalCount: schema.totalMembersByLevel.totalCount })
    .from(schema.totalMembersByLevel)
    .where(eq(schema.totalMembersByLevel.userAddress, address))
    .orderBy(schema.totalMembersByLevel.levelId);

  res.json(rows.map((r) => ({ level: r.levelId, count: r.totalCount.toString() })));
});

// Replaces the dead directReferrals-array-getter-based BFS (that mapping was
// removed from the contract, it was write-only dead weight). Whole downline,
// any depth, via a recursive CTE over user_registrations; packageId (level
// track, matches original semantics exactly) and totalBussiness (that
// member's own userTotalInvestment — a fixed value set once at registration,
// not their income) are live single-slot reads, N members × 2 calls.
teamRouter.get("/:address/team", async (req, res) => {
  const address = req.params.address.toLowerCase();
  const maxLevel = Math.min(Number(req.query.maxLevel) || 10, 20);

  const downline = await db.execute(sql`
    WITH RECURSIVE tree AS (
      SELECT member_address, string_id, block_timestamp, 1 AS depth
      FROM user_registrations WHERE sponsor_address = ${address}
      UNION ALL
      SELECT ur.member_address, ur.string_id, ur.block_timestamp, t.depth + 1
      FROM user_registrations ur
      JOIN tree t ON ur.sponsor_address = t.member_address
      WHERE t.depth < ${maxLevel}
    )
    SELECT member_address, string_id, block_timestamp, depth FROM tree
    ORDER BY depth, block_timestamp
  `);

  const rows = await Promise.all(downline.map(async (r: any, i: number) => {
    const [levelPackageId, investment] = await Promise.all([
      contract.levelPackageId(r.member_address),
      contract.userTotalInvestment(r.member_address),
    ]);
    return {
      id: i + 1,
      date: r.block_timestamp,
      wallet: r.member_address,
      stringId: r.string_id,
      level: r.depth,
      packageId: Number(levelPackageId),
      totalBussiness: (investment as bigint).toString(),
    };
  }));

  res.json(rows);
});

// Team members at an exact depth who PURCHASED a specific package on a given
// track (event-sourced, historical — "purchased" not "current package level
// equals X", so someone who's since upgraded past packageId still counts).
// Distinct from /team, which reports each member's CURRENT package level;
// this is for pages that need "who bought package N", e.g. the level-detail
// summary card (members count + income :address actually earned from them).
// `amount` is :address's own income from that purchase (tx_hash-joined
// against the level income the purchase triggered), NOT the buyer's purchase
// price — those are different numbers and the card is about earned income.
// Only LEVEL track is wired to an income table today (level_income_events);
// extend with a track-keyed join if MATRIX/SPONSOR ever need this endpoint.
teamRouter.get("/:address/level-purchasers/:depth/:packageId", async (req, res) => {
  const address = req.params.address.toLowerCase();
  const depth = Number(req.params.depth);
  const packageId = Number(req.params.packageId);
  const track = typeof req.query.track === "string" ? req.query.track.toUpperCase() : "LEVEL";

  const rows = await db.execute(sql`
    WITH RECURSIVE tree AS (
      SELECT member_address, string_id, block_timestamp, 1 AS depth
      FROM user_registrations WHERE sponsor_address = ${address}
      UNION ALL
      SELECT ur.member_address, ur.string_id, ur.block_timestamp, t.depth + 1
      FROM user_registrations ur
      JOIN tree t ON ur.sponsor_address = t.member_address
      WHERE t.depth < ${depth}
    )
    SELECT t.member_address, t.string_id, t.block_timestamp,
           COALESCE(li.amount, 0) AS amount
    FROM tree t
    JOIN package_purchase_events p
      ON p.member_address = t.member_address AND p.track = ${track} AND p.package_id = ${packageId}
    LEFT JOIN level_income_events li
      ON li.tx_hash = p.tx_hash AND li.receiver = ${address} AND li.from_address = t.member_address
    WHERE t.depth = ${depth}
    ORDER BY t.block_timestamp
  `);

  res.json(rows.map((r: any, i: number) => ({
    id: i + 1,
    date: r.block_timestamp,
    wallet: r.member_address,
    stringId: r.string_id,
    amount: r.amount,
  })));
});

// Replaces the dead live-loop version of checkTeamMembership (was up to 200
// sequential contract.sponsor() calls walking target's ancestor chain).
// Same check, one query: walk target's sponsor chain via user_registrations
// and see if :address ever appears in it — that's exactly "is :address an
// ancestor of :target", i.e. "is target in :address's downline".
teamRouter.get("/:address/is-ancestor-of/:targetAddress", async (req, res) => {
  const address = req.params.address.toLowerCase();
  const targetAddress = req.params.targetAddress.toLowerCase();

  const rows = await db.execute(sql`
    WITH RECURSIVE chain AS (
      SELECT member_address, sponsor_address FROM user_registrations WHERE member_address = ${targetAddress}
      UNION ALL
      SELECT ur.member_address, ur.sponsor_address
      FROM user_registrations ur
      JOIN chain c ON ur.member_address = c.sponsor_address
    )
    SELECT EXISTS (SELECT 1 FROM chain WHERE sponsor_address = ${address}) AS is_ancestor
  `);

  res.json({ isAncestor: Boolean((rows[0] as any)?.is_ancestor) });
});
