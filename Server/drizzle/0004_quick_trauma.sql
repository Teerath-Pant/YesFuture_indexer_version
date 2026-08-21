DROP INDEX IF EXISTS "matrix_placement_parent_pkg_idx";--> statement-breakpoint
ALTER TABLE "matrix_placements" ADD COLUMN "track" smallint DEFAULT 1 NOT NULL;--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "matrix_placement_parent_pkg_idx" ON "matrix_placements" USING btree ("package_id","track","parent_address");