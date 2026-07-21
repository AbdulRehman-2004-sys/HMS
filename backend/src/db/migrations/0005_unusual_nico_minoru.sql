ALTER TABLE "patient_visits" ALTER COLUMN "status" SET DEFAULT 'WAITING';--> statement-breakpoint
ALTER TABLE "patient_visits" ADD COLUMN "doctor_id" uuid NOT NULL;--> statement-breakpoint
ALTER TABLE "patient_visits" ADD COLUMN "token_number" integer DEFAULT 1 NOT NULL;--> statement-breakpoint
ALTER TABLE "patient_visits" ADD COLUMN "chief_complaint" text;--> statement-breakpoint
ALTER TABLE "patient_visits" ADD COLUMN "temperature" varchar(20);--> statement-breakpoint
ALTER TABLE "patient_visits" ADD COLUMN "pulse" varchar(20);--> statement-breakpoint
ALTER TABLE "patient_visits" ADD COLUMN "blood_pressure" varchar(30);--> statement-breakpoint
ALTER TABLE "patient_visits" ADD COLUMN "weight" varchar(20);--> statement-breakpoint
ALTER TABLE "patient_visits" ADD COLUMN "clinical_notes" text;--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "patient_visits" ADD CONSTRAINT "patient_visits_doctor_id_doctors_id_fk" FOREIGN KEY ("doctor_id") REFERENCES "public"."doctors"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
