import { Router } from "express";
import { eq, sql } from "drizzle-orm";
import { db, schema } from "../../db/client.js";

export const dashboardRouter = Router();

function isAddress(v: string) {
  return /^0x[0-9a-fA-F]{40}$/.test(v);
}

// Plain row read — directPartners/totalTeam are indexer-maintained running
// totals (backfill-safe). No "today" fields here; see /:address/today.
// NOTE: lowercase inline in every handler, not via a shared .use() middleware
// — Express re-derives req.params fresh for each matching layer, so a
// middleware mutating req.params.address does NOT survive into the .get()
// handler. Caused a real bug: mixed-case (checksummed, e.g. from ethers)
// addresses silently missed every DB row until this was inlined per-handler.
dashboardRouter.get("/:address", async (req, res) => {
  const user = req.params.address.toLowerCase();
  if (!isAddress(user)) return res.status(400).json({ error: "invalid address" });

  const rows = await db.select().from(schema.dashboard).where(eq(schema.dashboard.userAddress, user));
  if (!rows.length) return res.status(404).json({ error: "NOT_INDEXED" });
  res.json(rows[0]);
});

// Day-relative counts, split out from the base row on purpose: can't be plain
// indexer-incremented columns (no backfill-safety, no midnight reset), so
// computed live on every call from user_registrations.block_timestamp.
// Side-effect free — nothing written back to the dashboard table.
dashboardRouter.get("/:address/today", async (req, res) => {
  const user = req.params.address.toLowerCase();

  const [todayDirectRows, todayTeamRows] = await Promise.all([
    db.execute(sql`
      SELECT count(*)::bigint AS count FROM user_registrations
      WHERE sponsor_address = ${user} AND block_timestamp >= date_trunc('day', now())
    `),
    db.execute(sql`
      WITH RECURSIVE downline AS (
        SELECT member_address, block_timestamp FROM user_registrations WHERE sponsor_address = ${user}
        UNION ALL
        SELECT ur.member_address, ur.block_timestamp FROM user_registrations ur
        JOIN downline d ON ur.sponsor_address = d.member_address
      )
      SELECT count(*) FILTER (WHERE block_timestamp >= date_trunc('day', now()))::bigint AS count FROM downline
    `),
  ]);

  res.json({
    todayJoinedDirectPartners: String((todayDirectRows[0] as any).count),
    totalTeamJoinedToday: String((todayTeamRows[0] as any).count),
  });
});
