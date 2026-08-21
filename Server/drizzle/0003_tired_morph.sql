CREATE TABLE IF NOT EXISTS "sponsor_cycle_ui" (
	"id" serial PRIMARY KEY NOT NULL,
	"package_id" smallint NOT NULL,
	"cycle" bigint NOT NULL,
	"cycle_position" smallint NOT NULL,
	"user_address" text NOT NULL,
	"sponsor_string_id" text DEFAULT '' NOT NULL,
	"sponsor_address" text DEFAULT '' NOT NULL,
	"direct_partner_address" text NOT NULL,
	"direct_partner_string_id" text DEFAULT 'ID ...' NOT NULL,
	"total_referral_income" numeric(78, 0) DEFAULT '0' NOT NULL,
	"is_held" boolean DEFAULT false NOT NULL,
	"block_number" bigint NOT NULL,
	"tx_hash" text NOT NULL,
	"log_index" integer NOT NULL,
	"block_timestamp" timestamp NOT NULL
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "sponsor_cycle_ui_user_pkg_cycle_idx" ON "sponsor_cycle_ui" USING btree ("user_address","package_id","cycle");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "sponsor_cycle_ui_tx_log_unique" ON "sponsor_cycle_ui" USING btree ("tx_hash","log_index","user_address");
--> statement-breakpoint
WITH sponsor_purchases AS (
	SELECT tx_hash, package_id, wallet_address AS buyer_address
	FROM transactions
	WHERE type = 'PACKAGE_PURCHASE'
		AND track IN ('SPONSOR', 'SPONSOR_AUTO')
		AND package_id IS NOT NULL
),
sponsor_reentries AS (
	SELECT tx_hash, package_id, wallet_address AS sponsor_address
	FROM transactions
	WHERE type = 'SPONSOR_REENTRY'
		AND package_id IS NOT NULL
),
slot_events AS (
	SELECT
		t.package_id,
		t.cycle::smallint AS cycle_position,
		t.wallet_address AS user_address,
		COALESCE(sr.sponsor_address, t.counterparty_address) AS direct_partner_address,
		COALESCE(t.amount, '0') AS total_referral_income,
		false AS is_held,
		t.block_number,
		t.tx_hash,
		t.log_index,
		t.block_timestamp,
		1 AS source_order
	FROM transactions t
	LEFT JOIN sponsor_reentries sr
		ON sr.tx_hash = t.tx_hash
		AND sr.package_id = t.package_id
		AND t.cycle = 5
	WHERE t.type = 'DIRECT_INCOME'
		AND t.package_id IS NOT NULL
		AND t.cycle IS NOT NULL
	UNION ALL
	SELECT
		t.package_id,
		t.cycle::smallint AS cycle_position,
		t.wallet_address AS user_address,
		sp.buyer_address AS direct_partner_address,
		'0'::numeric(78, 0) AS total_referral_income,
		true AS is_held,
		t.block_number,
		t.tx_hash,
		t.log_index,
		t.block_timestamp,
		2 AS source_order
	FROM transactions t
	JOIN sponsor_purchases sp
		ON sp.tx_hash = t.tx_hash
		AND sp.package_id = t.package_id
	WHERE t.type = 'SPONSOR_INCOME_HELD'
		AND t.package_id IS NOT NULL
		AND t.cycle IS NOT NULL
	UNION ALL
	SELECT
		t.package_id,
		5::smallint AS cycle_position,
		t.wallet_address AS user_address,
		sp.buyer_address AS direct_partner_address,
		'0'::numeric(78, 0) AS total_referral_income,
		false AS is_held,
		t.block_number,
		t.tx_hash,
		t.log_index,
		t.block_timestamp,
		3 AS source_order
	FROM transactions t
	JOIN sponsor_purchases sp
		ON sp.tx_hash = t.tx_hash
		AND sp.package_id = t.package_id
	WHERE t.type = 'SPONSOR_REENTRY'
		AND t.package_id IS NOT NULL
),
ordered_slots AS (
	SELECT
		*,
		LAG(cycle_position) OVER (
			PARTITION BY user_address, package_id
			ORDER BY block_number, log_index, source_order
		) AS previous_cycle_position
	FROM slot_events
	WHERE cycle_position > 0
		AND direct_partner_address IS NOT NULL
		AND direct_partner_address <> ''
),
numbered_slots AS (
	SELECT
		*,
		SUM(
			CASE
				WHEN previous_cycle_position IS NULL OR cycle_position <= previous_cycle_position THEN 1
				ELSE 0
			END
		) OVER (
			PARTITION BY user_address, package_id
			ORDER BY block_number, log_index, source_order
		) AS cycle
	FROM ordered_slots
)
INSERT INTO sponsor_cycle_ui (
	package_id,
	cycle,
	cycle_position,
	user_address,
	sponsor_string_id,
	sponsor_address,
	direct_partner_address,
	direct_partner_string_id,
	total_referral_income,
	is_held,
	block_number,
	tx_hash,
	log_index,
	block_timestamp
)
SELECT
	ns.package_id,
	ns.cycle,
	ns.cycle_position,
	ns.user_address,
	COALESCE(sponsor_reg.string_id, ''),
	COALESCE(owner_reg.sponsor_address, ''),
	ns.direct_partner_address,
	COALESCE(partner_reg.string_id, 'ID ...'),
	ns.total_referral_income,
	ns.is_held,
	ns.block_number,
	ns.tx_hash,
	ns.log_index,
	ns.block_timestamp
FROM numbered_slots ns
LEFT JOIN user_registrations owner_reg ON owner_reg.member_address = ns.user_address
LEFT JOIN user_registrations sponsor_reg ON sponsor_reg.member_address = owner_reg.sponsor_address
LEFT JOIN user_registrations partner_reg ON partner_reg.member_address = ns.direct_partner_address
ON CONFLICT DO NOTHING;
