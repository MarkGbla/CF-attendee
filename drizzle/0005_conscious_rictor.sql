ALTER TABLE "challenges" ALTER COLUMN "decay_interval_seconds" SET DEFAULT 600;--> statement-breakpoint
ALTER TABLE "challenges" ADD COLUMN "decay_points_per_interval" integer DEFAULT 1 NOT NULL;