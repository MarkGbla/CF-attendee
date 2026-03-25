CREATE TABLE "manual_points_log" (
	"id" serial PRIMARY KEY NOT NULL,
	"student_id" integer NOT NULL,
	"points" integer NOT NULL,
	"reason" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "manual_points_log" ADD CONSTRAINT "manual_points_log_student_id_students_id_fk" FOREIGN KEY ("student_id") REFERENCES "public"."students"("id") ON DELETE cascade ON UPDATE no action;