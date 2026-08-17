import { Router } from "express";
import { eq, sql } from "drizzle-orm";
import { db, schema } from "../../db/client.js";

export const incomeRouter = Router();

function isAddress(v: string) {
  return /^0x[0-9a-fA-F]{40}$/.test(v);
}

// Plain row read. total* columns are indexer-maintained running totals
// (backfill-safe). totalIncome is a Postgres generated column. No "today"
// fields here; see /:address/today.
// NOTE: lowercase inline in every handler — see dashboard.ts for why a
// shared .use() middleware mutating req.params.address doesn't work.
incomeRouter.get("/:address", async (req, res) => {
  const user = req.params.address.toLowerCase();
  if (!isAddress(user)) return res.status(400).json({ error: "invalid address" });

  const rows = await db.select().from(schema.income).where(eq(schema.income.walletAddress, user));
  if (!rows.length) return res.status(404).json({ error: "NOT_INDEXED" });
  res.json(rows[0]);
});

// Day-relative sums, split out from the base row on purpose: can't be plain
// indexer-incremented columns (no backfill-safety, no midnight reset), so
// computed live on every call from the 3 income-event tables. Side-effect
// free — nothing written back to the income table.
incomeRouter.get("/:address/today", async (req, res) => {
  const user = req.params.address.toLowerCase();

  const [todayLevel, todayMatrix, todaySponsor] = await Promise.all([
    db.execute(sql`
      SELECT coalesce(sum(amount), 0)::text AS total FROM level_income_events
      WHERE receiver = ${user} AND block_timestamp >= date_trunc('day', now())
    `),
    db.execute(sql`
      SELECT coalesce(sum(amount), 0)::text AS total FROM matrix_income_events
      WHERE receiver = ${user} AND block_timestamp >= date_trunc('day', now())
    `),
    db.execute(sql`
      SELECT coalesce(sum(amount), 0)::text AS total FROM direct_income_events
      WHERE receiver = ${user} AND block_timestamp >= date_trunc('day', now())
    `),
  ]);

  const todayMagicLevelIncome = String((todayLevel[0] as any).total);
  const todayMagicGoldMatrixIncome = String((todayMatrix[0] as any).total);
  const todaySponsorIncome = String((todaySponsor[0] as any).total);
  const todayTotalIncome = (
    BigInt(todayMagicLevelIncome) + BigInt(todayMagicGoldMatrixIncome) + BigInt(todaySponsorIncome)
  ).toString();

  res.json({ todayMagicLevelIncome, todayMagicGoldMatrixIncome, todaySponsorIncome, todayTotalIncome });
});
