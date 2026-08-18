CREATE TABLE IF NOT EXISTS "dashboard" (
	"user_address" text PRIMARY KEY NOT NULL,
	"sponsor_id" text DEFAULT '' NOT NULL,
	"direct_partners" bigint DEFAULT 0 NOT NULL,
	"total_team" bigint DEFAULT 0 NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "direct_income_events" (
	"id" serial PRIMARY KEY NOT NULL,
	"receiver" text NOT NULL,
	"from_address" text NOT NULL,
	"package_id" smallint NOT NULL,
	"cycle" bigint NOT NULL,
	"amount" numeric(78, 0) NOT NULL,
	"block_number" bigint NOT NULL,
	"tx_hash" text NOT NULL,
	"log_index" integer NOT NULL,
	"block_timestamp" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "income" (
	"wallet_address" text PRIMARY KEY NOT NULL,
	"total_magic_level_income" numeric(78, 0) DEFAULT '0' NOT NULL,
	"total_magic_gold_matrix_income" numeric(78, 0) DEFAULT '0' NOT NULL,
	"total_sponsor_income" numeric(78, 0) DEFAULT '0' NOT NULL,
	"total_income" numeric(78, 0) GENERATED ALWAYS AS (total_magic_level_income + total_magic_gold_matrix_income + total_sponsor_income) STORED,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "indexer_state" (
	"id" smallint PRIMARY KEY NOT NULL,
	"last_processed_block" bigint NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "level5_reentries" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_address" text NOT NULL,
	"package_id" smallint NOT NULL,
	"cycle_number" bigint NOT NULL,
	"phantom_node" text NOT NULL,
	"block_number" bigint NOT NULL,
	"tx_hash" text NOT NULL,
	"log_index" integer NOT NULL,
	"block_timestamp" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "level_income_events" (
	"id" serial PRIMARY KEY NOT NULL,
	"receiver" text NOT NULL,
	"from_address" text NOT NULL,
	"level" smallint NOT NULL,
	"amount" numeric(78, 0) NOT NULL,
	"block_number" bigint NOT NULL,
	"tx_hash" text NOT NULL,
	"log_index" integer NOT NULL,
	"block_timestamp" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "matrix_income_events" (
	"id" serial PRIMARY KEY NOT NULL,
	"receiver" text NOT NULL,
	"from_address" text NOT NULL,
	"level" smallint NOT NULL,
	"amount" numeric(78, 0) NOT NULL,
	"block_number" bigint NOT NULL,
	"tx_hash" text NOT NULL,
	"log_index" integer NOT NULL,
	"block_timestamp" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "matrix_placements" (
	"id" serial PRIMARY KEY NOT NULL,
	"package_id" smallint NOT NULL,
	"child_address" text NOT NULL,
	"parent_address" text NOT NULL,
	"sponsor_address" text NOT NULL,
	"block_number" bigint NOT NULL,
	"tx_hash" text NOT NULL,
	"log_index" integer NOT NULL,
	"block_timestamp" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "package_purchase_events" (
	"id" serial PRIMARY KEY NOT NULL,
	"member_address" text NOT NULL,
	"package_id" smallint NOT NULL,
	"track" text NOT NULL,
	"amount" numeric(78, 0) NOT NULL,
	"source" text NOT NULL,
	"block_number" bigint NOT NULL,
	"tx_hash" text NOT NULL,
	"log_index" integer NOT NULL,
	"block_timestamp" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "total_members_by_level" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_address" text NOT NULL,
	"sponsor_address" text NOT NULL,
	"level_id" smallint NOT NULL,
	"total_count" bigint DEFAULT 0 NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "transactions" (
	"id" serial PRIMARY KEY NOT NULL,
	"type" text NOT NULL,
	"wallet_address" text NOT NULL,
	"sponsor_address" text,
	"counterparty_address" text,
	"package_id" smallint,
	"track" text,
	"source" text,
	"level" smallint,
	"cycle" bigint,
	"amount" numeric(78, 0),
	"block_number" bigint NOT NULL,
	"tx_hash" text NOT NULL,
	"log_index" integer NOT NULL,
	"block_timestamp" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "user_details" (
	"user_address" text PRIMARY KEY NOT NULL,
	"sponsor_address" text NOT NULL,
	"user_name" text,
	"date_of_registration" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "user_registrations" (
	"id" serial PRIMARY KEY NOT NULL,
	"member_address" text NOT NULL,
	"sponsor_address" text NOT NULL,
	"member_id" bigint NOT NULL,
	"string_id" text NOT NULL,
	"block_number" bigint NOT NULL,
	"tx_hash" text NOT NULL,
	"log_index" integer NOT NULL,
	"block_timestamp" timestamp NOT NULL,
	CONSTRAINT "user_registrations_member_address_unique" UNIQUE("member_address")
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "direct_income_receiver_idx" ON "direct_income_events" USING btree ("receiver");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "direct_income_tx_log_unique" ON "direct_income_events" USING btree ("tx_hash","log_index");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "level5_reentry_user_pkg_idx" ON "level5_reentries" USING btree ("user_address","package_id");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "level5_reentry_tx_log_unique" ON "level5_reentries" USING btree ("tx_hash","log_index");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "level_income_receiver_idx" ON "level_income_events" USING btree ("receiver");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "level_income_tx_log_unique" ON "level_income_events" USING btree ("tx_hash","log_index");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "matrix_income_receiver_idx" ON "matrix_income_events" USING btree ("receiver");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "matrix_income_tx_log_unique" ON "matrix_income_events" USING btree ("tx_hash","log_index");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "matrix_placement_parent_pkg_idx" ON "matrix_placements" USING btree ("package_id","parent_address");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "matrix_placement_child_idx" ON "matrix_placements" USING btree ("child_address");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "matrix_placement_tx_log_unique" ON "matrix_placements" USING btree ("tx_hash","log_index");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "package_purchase_member_idx" ON "package_purchase_events" USING btree ("member_address");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "package_purchase_tx_log_unique" ON "package_purchase_events" USING btree ("tx_hash","log_index");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "total_members_by_level_user_level_unique" ON "total_members_by_level" USING btree ("user_address","level_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "transactions_wallet_idx" ON "transactions" USING btree ("wallet_address","block_timestamp");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "transactions_type_idx" ON "transactions" USING btree ("type");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "transactions_tx_log_unique" ON "transactions" USING btree ("tx_hash","log_index");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "user_details_sponsor_idx" ON "user_details" USING btree ("sponsor_address");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "user_reg_sponsor_idx" ON "user_registrations" USING btree ("sponsor_address");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "user_reg_tx_log_unique" ON "user_registrations" USING btree ("tx_hash","log_index");