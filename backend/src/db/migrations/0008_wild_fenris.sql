CREATE TABLE IF NOT EXISTS "lab_report_items" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"report_id" uuid NOT NULL,
	"parameter_name" varchar(255) NOT NULL,
	"result_value" varchar(255) NOT NULL,
	"unit" varchar(50),
	"reference_range" varchar(150),
	"is_abnormal" boolean DEFAULT false NOT NULL,
	"remarks" text,
	"sequence" integer DEFAULT 1 NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "lab_reports" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"lab_order_id" uuid NOT NULL,
	"visit_id" uuid NOT NULL,
	"patient_id" uuid NOT NULL,
	"technician_id" uuid,
	"technician_name" varchar(150) DEFAULT 'Lab Staff' NOT NULL,
	"report_number" varchar(50) NOT NULL,
	"status" varchar(30) DEFAULT 'IN_PROGRESS' NOT NULL,
	"overall_remarks" text,
	"technician_notes" text,
	"result_date" timestamp DEFAULT now() NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "lab_reports_report_number_unique" UNIQUE("report_number")
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "lab_report_items" ADD CONSTRAINT "lab_report_items_report_id_lab_reports_id_fk" FOREIGN KEY ("report_id") REFERENCES "public"."lab_reports"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "lab_reports" ADD CONSTRAINT "lab_reports_lab_order_id_lab_orders_id_fk" FOREIGN KEY ("lab_order_id") REFERENCES "public"."lab_orders"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "lab_reports" ADD CONSTRAINT "lab_reports_visit_id_patient_visits_id_fk" FOREIGN KEY ("visit_id") REFERENCES "public"."patient_visits"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "lab_reports" ADD CONSTRAINT "lab_reports_patient_id_patients_id_fk" FOREIGN KEY ("patient_id") REFERENCES "public"."patients"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "lab_reports" ADD CONSTRAINT "lab_reports_technician_id_users_id_fk" FOREIGN KEY ("technician_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
