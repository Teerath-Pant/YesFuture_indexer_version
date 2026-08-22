import { Router } from "express";
import { sql } from "drizzle-orm";
import { db } from "../../db/client.js";

export const transactionsRouter = Router();

function isAddress(v: string) {
  return /^0x[0-9a-fA-F]{40}$/.test(v);
}

// Global "platform recent activity" feed — every income payout across ALL
// users, newest first, receiver/from resolved to string IDs server-side
// (joins user_registrations twice). Income types only — purchases (deducted
// amounts) are noise on this card, dropped per explicit request; admin
// (YF00001, memberId=1) excluded on both sides too — admin routinely
// receives MATRIX_INCOME/LEVEL_INCOME as the root uplink fallback, which
// isn't meaningful "activity" for this feed. Placements/re-entries/
// registrations/held-events/purchases are in the per-wallet feed
// (/:address) but not here.
transactionsRouter.get("/", async (req, res) => {
  const limit = Math.min(Number(req.query.limit) || 25, 200);

  const rows = await db.execute(sql`
    SELECT t.id, t.type, t.source, t.package_id, t.track, t.level, t.amount, t.block_timestamp,
           EXTRACT(EPOCH FROM t.block_timestamp AT TIME ZONE 'UTC')::bigint AS raw_date,
           ur1.string_id AS receiver_string_id,
           ur2.string_id AS from_string_id
    FROM transactions t
    LEFT JOIN user_registrations ur1 ON ur1.member_address = t.wallet_address
    LEFT JOIN user_registrations ur2 ON ur2.member_address = t.counterparty_address
    WHERE t.type IN ('MATRIX_INCOME', 'DIRECT_INCOME', 'LEVEL_INCOME')
      AND COALESCE(t.amount, 0) <> 0
      AND ur1.string_id IS DISTINCT FROM 'YF00001'
      AND ur2.string_id IS DISTINCT FROM 'YF00001'
    ORDER BY t.block_timestamp DESC, t.log_index DESC
    LIMIT ${limit}
  `);

  const incomeTypeFor = (type: string) => {
    if (type === "MATRIX_INCOME") return "MATRIX";
    if (type === "DIRECT_INCOME") return "SPONSOR";
    return "LEVEL"; // only these 3 types reach here, WHERE clause above
  };

  res.json(rows.map((r: any) => ({
    id: String(r.id),
    receiverId: r.receiver_string_id ?? "",
    fromId: r.from_string_id ?? "",
    amount: r.amount,
    rawDate: Number(r.raw_date),
    incomeType: incomeTypeFor(r.type),
    level: r.level ?? undefined,
    packageId: r.package_id ?? undefined,
    track: r.track ?? undefined,
  })));
});

// Unified activity feed — every package purchase + every income payout across
// all 3 tracks + placements/re-entries, one wallet, newest first. Optional
// ?type=MATRIX_INCOME (etc, see schema.ts `transactions` comment for the list).
// counterpartyStringId resolved server-side (LEFT JOIN user_registrations) —
// this is the single source every per-track income-history page reads from.
transactionsRouter.get("/:address", async (req, res) => {
  const user = req.params.address.toLowerCase();
  if (!isAddress(user)) return res.status(400).json({ error: "invalid address" });

  const type = typeof req.query.type === "string" ? req.query.type.toUpperCase() : undefined;
  const limit = Math.min(Number(req.query.limit) || 50, 200);
  const offset = Number(req.query.offset) || 0;

  // recycled_sponsor_string_id: DIRECT_INCOME's 5th-slot payout is emitted
  // with counterparty_address = whoever's registration triggered the 5th
  // slot (the literal money source), not the sponsor whose own cycle
  // completed — that's a separate SPONSOR_REENTRY row, same tx_hash, whose
  // wallet_address IS the recycling sponsor. Joined here (scoped to
  // cycle=5 so it can't accidentally attach to an unrelated row that
  // happens to share a tx_hash with some other type) so callers like the
  // Sponsor Magic cycle grid can label that slot with the recycling
  // sponsor instead of the triggering buyer.
  const rows = await db.execute(sql`
    SELECT t.*, ur.string_id AS counterparty_string_id, ur2.string_id AS recycled_sponsor_string_id
    FROM transactions t
    LEFT JOIN user_registrations ur ON ur.member_address = t.counterparty_address
    LEFT JOIN transactions reentry ON reentry.tx_hash = t.tx_hash
      AND reentry.type = 'SPONSOR_REENTRY' AND t.type = 'DIRECT_INCOME' AND t.cycle = 5
    LEFT JOIN user_registrations ur2 ON ur2.member_address = reentry.wallet_address
    WHERE t.wallet_address = ${user}
      ${type ? sql`AND t.type = ${type}` : sql``}
    ORDER BY t.block_timestamp DESC, t.log_index DESC
    LIMIT ${limit} OFFSET ${offset}
  `);

  res.json(rows);
});
