import { pgTable, serial, text, smallint, integer, bigint, numeric, timestamp, uniqueIndex, index } from "drizzle-orm/pg-core";
import { sql, type SQL } from "drizzle-orm";

// One row per UserRegistered event. Rebuilds the team tree (walk `sponsorAddress`
// edges) that used to live in the deleted teamChildrenByLevel mapping.
export const userRegistrations = pgTable("user_registrations", {
  id: serial("id").primaryKey(),
  memberAddress: text("member_address").notNull().unique(),
  sponsorAddress: text("sponsor_address").notNull(),
  memberId: bigint("member_id", { mode: "bigint" }).notNull(),
  stringId: text("string_id").notNull(),
  blockNumber: bigint("block_number", { mode: "bigint" }).notNull(),
  txHash: text("tx_hash").notNull(),
  logIndex: integer("log_index").notNull(),
  blockTimestamp: timestamp("block_timestamp").notNull(),
}, (t) => ({
  sponsorIdx: index("user_reg_sponsor_idx").on(t.sponsorAddress),
  txLogUnique: uniqueIndex("user_reg_tx_log_unique").on(t.txHash, t.logIndex),
}));

// Replaces deleted `matrixIncomeHistory`.
export const matrixIncomeEvents = pgTable("matrix_income_events", {
  id: serial("id").primaryKey(),
  receiver: text("receiver").notNull(),
  fromAddress: text("from_address").notNull(),
  // Nullable: only present on events from the redeployed contract (MatrixIncome
  // extended to carry packageId natively, mirroring DirectIncome). Rows indexed
  // from the pre-redeploy contract have no packageId here — routes fall back to
  // the tx_hash join against package_purchase_events for those.
  packageId: smallint("package_id"),
  level: smallint("level").notNull(),
  amount: numeric("amount", { precision: 78, scale: 0 }).notNull(),
  blockNumber: bigint("block_number", { mode: "bigint" }).notNull(),
  txHash: text("tx_hash").notNull(),
  logIndex: integer("log_index").notNull(),
  blockTimestamp: timestamp("block_timestamp").notNull(),
}, (t) => ({
  receiverIdx: index("matrix_income_receiver_idx").on(t.receiver),
  txLogUnique: uniqueIndex("matrix_income_tx_log_unique").on(t.txHash, t.logIndex),
}));

// Replaces deleted `referralIncomeHistory`. DirectIncome event was extended with
// packageId + cycle so this table carries the same fields the old struct had.
export const directIncomeEvents = pgTable("direct_income_events", {
  id: serial("id").primaryKey(),
  receiver: text("receiver").notNull(),
  fromAddress: text("from_address").notNull(),
  packageId: smallint("package_id").notNull(),
  cycle: bigint("cycle", { mode: "bigint" }).notNull(),
  amount: numeric("amount", { precision: 78, scale: 0 }).notNull(),
  blockNumber: bigint("block_number", { mode: "bigint" }).notNull(),
  txHash: text("tx_hash").notNull(),
  logIndex: integer("log_index").notNull(),
  blockTimestamp: timestamp("block_timestamp").notNull(),
}, (t) => ({
  receiverIdx: index("direct_income_receiver_idx").on(t.receiver),
  txLogUnique: uniqueIndex("direct_income_tx_log_unique").on(t.txHash, t.logIndex),
}));

// Replaces deleted `levelIncomeHistory`. LevelIncome event was extended with
// packageId. Nullable: rows indexed from the pre-redeploy contract have no
// packageId here — routes fall back to the tx_hash join against
// package_purchase_events for those (same pattern as matrix_income_events).
export const levelIncomeEvents = pgTable("level_income_events", {
  id: serial("id").primaryKey(),
  receiver: text("receiver").notNull(),
  fromAddress: text("from_address").notNull(),
  packageId: smallint("package_id"),
  level: smallint("level").notNull(),
  amount: numeric("amount", { precision: 78, scale: 0 }).notNull(),
  blockNumber: bigint("block_number", { mode: "bigint" }).notNull(),
  txHash: text("tx_hash").notNull(),
  logIndex: integer("log_index").notNull(),
  blockTimestamp: timestamp("block_timestamp").notNull(),
}, (t) => ({
  receiverIdx: index("level_income_receiver_idx").on(t.receiver),
  txLogUnique: uniqueIndex("level_income_tx_log_unique").on(t.txHash, t.logIndex),
}));

// Replaces deleted `userPackageHistory`. Sourced from ManualUpgrade (source=MANUAL,
// also covers the 3 register-time grants) and MatrixAutoUpgrade/SponsorAutoUpgrade
// (source=AUTO, track synthesized as MATRIX_AUTO/SPONSOR_AUTO).
export const packagePurchaseEvents = pgTable("package_purchase_events", {
  id: serial("id").primaryKey(),
  memberAddress: text("member_address").notNull(),
  packageId: smallint("package_id").notNull(),
  track: text("track").notNull(), // MATRIX | SPONSOR | LEVEL | MATRIX_AUTO | SPONSOR_AUTO
  amount: numeric("amount", { precision: 78, scale: 0 }).notNull(),
  source: text("source").notNull(), // MANUAL | AUTO
  blockNumber: bigint("block_number", { mode: "bigint" }).notNull(),
  txHash: text("tx_hash").notNull(),
  logIndex: integer("log_index").notNull(),
  blockTimestamp: timestamp("block_timestamp").notNull(),
}, (t) => ({
  memberIdx: index("package_purchase_member_idx").on(t.memberAddress),
  txLogUnique: uniqueIndex("package_purchase_tx_log_unique").on(t.txHash, t.logIndex),
}));

// Replaces the on-chain `matrixChildrenByPkg` / `matrixParentByPkg` read path
// (MatrixTreeInfo getter). Sourced from MatrixPlaced events, one row per placement.
export const matrixPlacements = pgTable("matrix_placements", {
  id: serial("id").primaryKey(),
  packageId: smallint("package_id").notNull(),
  childAddress: text("child_address").notNull(),
  parentAddress: text("parent_address").notNull(),
  sponsorAddress: text("sponsor_address").notNull(),
  blockNumber: bigint("block_number", { mode: "bigint" }).notNull(),
  txHash: text("tx_hash").notNull(),
  logIndex: integer("log_index").notNull(),
  blockTimestamp: timestamp("block_timestamp").notNull(),
}, (t) => ({
  parentPkgIdx: index("matrix_placement_parent_pkg_idx").on(t.packageId, t.parentAddress),
  childIdx: index("matrix_placement_child_idx").on(t.childAddress),
  txLogUnique: uniqueIndex("matrix_placement_tx_log_unique").on(t.txHash, t.logIndex),
}));

// Replaces the on-chain `cycleRootByPkg` read path (MagicGoldMatrixStructure /
// CycleCount getters). Cycle root #0 is always the user's own MatrixPlaced entry;
// every row here is a subsequent re-entry root (phantomNode).
export const level5Reentries = pgTable("level5_reentries", {
  id: serial("id").primaryKey(),
  userAddress: text("user_address").notNull(),
  packageId: smallint("package_id").notNull(),
  cycleNumber: bigint("cycle_number", { mode: "bigint" }).notNull(),
  phantomNode: text("phantom_node").notNull(),
  blockNumber: bigint("block_number", { mode: "bigint" }).notNull(),
  txHash: text("tx_hash").notNull(),
  logIndex: integer("log_index").notNull(),
  blockTimestamp: timestamp("block_timestamp").notNull(),
}, (t) => ({
  userPkgIdx: index("level5_reentry_user_pkg_idx").on(t.userAddress, t.packageId),
  txLogUnique: uniqueIndex("level5_reentry_tx_log_unique").on(t.txHash, t.logIndex),
}));

// Denormalized one-row-per-user dashboard summary. Kept in sync by the indexer
// so the dashboard page is a single-row read with zero chain calls.
// directPartners / totalTeam are running totals, bumped on every UserRegistered
// event. Day-relative "today joined" counts are NOT stored here — they're
// computed live, on demand, by GET /dashboard/:address/today (see dashboard.ts)
// straight from user_registrations.block_timestamp. No column, no write-back.
export const dashboard = pgTable("dashboard", {
  userAddress: text("user_address").primaryKey(),
  sponsorId: text("sponsor_id").notNull().default(""),

  directPartners: bigint("direct_partners", { mode: "bigint" }).notNull().default(sql`0`),
  totalTeam: bigint("total_team", { mode: "bigint" }).notNull().default(sql`0`),

  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// Denormalized one-row-per-user income summary (all 3 tracks). total* columns
// are indexer-maintained running totals. totalIncome is a Postgres generated
// column, always the correct sum. Day-relative "today" sums are NOT stored
// here — computed live, on demand, by GET /income/:address/today (see
// income.ts) straight from the 3 income-event tables. No column, no write-back.
export const income = pgTable("income", {
  walletAddress: text("wallet_address").primaryKey(),

  totalMagicLevelIncome: numeric("total_magic_level_income", { precision: 78, scale: 0 }).notNull().default("0"),
  totalMagicGoldMatrixIncome: numeric("total_magic_gold_matrix_income", { precision: 78, scale: 0 }).notNull().default("0"),
  totalSponsorIncome: numeric("total_sponsor_income", { precision: 78, scale: 0 }).notNull().default("0"),

  totalIncome: numeric("total_income", { precision: 78, scale: 0 }).generatedAlwaysAs(
    (): SQL => sql`total_magic_level_income + total_magic_gold_matrix_income + total_sponsor_income`,
  ),

  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// One row per financial/state-changing event, any package, any income track —
// a single feed for a wallet's full activity history. The per-type tables above
// still back their own dedicated pages; this is the "everything, one place" view.
// `type` values: REGISTRATION, PACKAGE_PURCHASE, MATRIX_INCOME, DIRECT_INCOME,
// LEVEL_INCOME, MATRIX_INCOME_HELD, SPONSOR_INCOME_HELD, MATRIX_PLACEMENT,
// LEVEL5_REENTRY, SPONSOR_REENTRY, INCOME_CAPPED, SPONSOR_INCOME_REDIRECTED,
// LEVEL_INCOME_REDIRECTED. Not every type fills every nullable column —
// e.g. only PACKAGE_PURCHASE sets track+source, only income types set level/cycle.
export const transactions = pgTable("transactions", {
  id: serial("id").primaryKey(),
  type: text("type").notNull(),

  walletAddress: text("wallet_address").notNull(), // the subject of this row (receiver/user/child)
  sponsorAddress: text("sponsor_address"), // walletAddress's direct sponsor, denormalized onto every row type
  counterpartyAddress: text("counterparty_address"), // the other party (from/parent/phantomNode), if any — not the sponsor

  packageId: smallint("package_id"),
  track: text("track"), // MATRIX | SPONSOR | LEVEL | MATRIX_AUTO | SPONSOR_AUTO — PACKAGE_PURCHASE only
  source: text("source"), // MANUAL | AUTO — PACKAGE_PURCHASE only
  level: smallint("level"), // MATRIX_INCOME | LEVEL_INCOME only
  cycle: bigint("cycle", { mode: "bigint" }), // DIRECT_INCOME | *_REENTRY only
  amount: numeric("amount", { precision: 78, scale: 0 }), // null for placement/reentry rows with no payout

  blockNumber: bigint("block_number", { mode: "bigint" }).notNull(),
  txHash: text("tx_hash").notNull(),
  logIndex: integer("log_index").notNull(),
  blockTimestamp: timestamp("block_timestamp").notNull(),
}, (t) => ({
  walletIdx: index("transactions_wallet_idx").on(t.walletAddress, t.blockTimestamp),
  typeIdx: index("transactions_type_idx").on(t.type),
  txLogUnique: uniqueIndex("transactions_tx_log_unique").on(t.txHash, t.logIndex),
}));

// One row per (userAddress, levelId) — running count of userAddress's downline
// at that exact depth. Replaces the deleted teamChildrenByLevel/getTeamByLevel
// walk: indexer increments totalCount for every ancestor, at their respective
// depth, on each UserRegistered event — same walk _buildLevelTeam used to do
// on-chain, just materialized here instead of recomputed live via recursive CTE.
export const totalMembersByLevel = pgTable("total_members_by_level", {
  id: serial("id").primaryKey(),
  userAddress: text("user_address").notNull(), // root whose downline this counts
  sponsorAddress: text("sponsor_address").notNull(), // userAddress's own direct sponsor
  levelId: smallint("level_id").notNull(), // depth into userAddress's downline
  totalCount: bigint("total_count", { mode: "bigint" }).notNull().default(sql`0`),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
}, (t) => ({
  userLevelUnique: uniqueIndex("total_members_by_level_user_level_unique").on(t.userAddress, t.levelId),
}));

// One row per user — simple profile lookup (address, sponsor, display name,
// join date). Distinct from user_registrations: that one is the raw event
// record with tx provenance (memberId/stringId/txHash) for the team-tree walk;
// this is just the flat profile shape a UI needs. userName starts null and is
// filled in later from NameUpdated events / setDisplayName.
export const userDetails = pgTable("user_details", {
  userAddress: text("user_address").primaryKey(),
  sponsorAddress: text("sponsor_address").notNull(),
  userName: text("user_name"),
  dateOfRegistration: timestamp("date_of_registration").notNull(),
}, (t) => ({
  sponsorIdx: index("user_details_sponsor_idx").on(t.sponsorAddress),
}));

// Single-row cursor: last block whose logs were fully processed.
export const indexerState = pgTable("indexer_state", {
  id: smallint("id").primaryKey(), // always 1
  lastProcessedBlock: bigint("last_processed_block", { mode: "bigint" }).notNull(),
});
