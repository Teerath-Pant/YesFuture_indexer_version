import { Router } from "express";
import { sql } from "drizzle-orm";
import { db } from "../../db/client.js";
import { contract } from "../../chain/contract.js";

export const systemRouter = Router();

// Live proxy — replaces deleted getSystemStats.
systemRouter.get("/stats", async (_req, res) => {
  const [totalMembers, totalUsdtInvested] = await Promise.all([
    contract.memberCounter(),
    contract.totalInvestment(),
  ]);
  res.json({ totalMembers: totalMembers.toString(), totalUsdtInvested: totalUsdtInvested.toString() });
});

// Platform-wide day-relative stats, not address-specific. totalInvestment only
// ever accumulates at registration (packages[1].price — purchase* calls never
// touch it, matches the on-chain accounting exactly), so today's invested
// amount is today's registration count times that same fixed price — same
// pattern as dashboard/income "today" endpoints: computed live, not stored.
systemRouter.get("/stats/today", async (_req, res) => {
  const [todayMembersRows, package1] = await Promise.all([
    db.execute(sql`
      SELECT count(*)::bigint AS count FROM user_registrations
      WHERE block_timestamp >= date_trunc('day', now())
    `),
    contract.packages(1),
  ]);
  const todayMembers = BigInt((todayMembersRows[0] as any).count);
  const todayUsdtInvested = todayMembers * (package1 as bigint);
  res.json({ todayMembers: todayMembers.toString(), todayUsdtInvested: todayUsdtInvested.toString() });
});

// Platform-wide leaderboard — never had on-chain storage (checked: no
// "leaderboard"/"rank" anywhere in contract.sol, not even before the trim).
// The old frontend computed it by scanning every member via memberCounter and
// calling 2 now-deleted getters per member. Rebuilt as one query instead:
// income.totalIncome DESC (matches the original's exact sort key), joined
// with dashboard.directPartners and user_registrations for the string ID.
// Admin (YF00001, memberId=1) excluded, same reasoning as the global
// activity feed — root racking up system-level income isn't a "leader".
systemRouter.get("/leaderboard", async (req, res) => {
  const limit = Math.min(Number(req.query.limit) || 100, 500);

  const rows = await db.execute(sql`
    SELECT ur.member_address, ur.string_id, ud.user_name,
           COALESCE(i.total_income, '0') AS total_income,
           COALESCE(d.direct_partners, 0) AS direct_partners
    FROM user_registrations ur
    LEFT JOIN income i ON i.wallet_address = ur.member_address
    LEFT JOIN dashboard d ON d.user_address = ur.member_address
    LEFT JOIN user_details ud ON ud.user_address = ur.member_address
    WHERE ur.string_id != 'YF00001'
    ORDER BY COALESCE(i.total_income, '0')::numeric DESC
    LIMIT ${limit}
  `);

  res.json(rows.map((r: any, index: number) => ({
    place: index + 1,
    userId: r.string_id,
    userName: r.user_name,
    fullWallet: r.member_address,
    partners: Number(r.direct_partners),
    totalIncome: r.total_income,
  })));
});

// Live proxy — replaces deleted getPackageCosts.
systemRouter.get("/packages/:id/costs", async (req, res) => {
  const packageId = Number(req.params.id);
  const [fullPrice, matrixPortion, sponsorPortion, levelPortion] = await Promise.all([
    contract.packages(packageId),
    contract.getMatrixPrice(packageId),
    contract.getSponsorPrice(packageId),
    contract.getLevelPrice(packageId),
  ]);
  res.json({
    fullPrice: fullPrice.toString(),
    matrixPortion: matrixPortion.toString(),
    sponsorPortion: sponsorPortion.toString(),
    levelPortion: levelPortion.toString(),
  });
});
