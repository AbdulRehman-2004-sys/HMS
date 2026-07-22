CREATE TABLE IF NOT EXISTS "radiology_reports" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"radiology_order_id" uuid NOT NULL,
	"visit_id" uuid NOT NULL,
	"patient_id" uuid NOT NULL,
	"technician_id" uuid,
	"technician_name" varchar(150) DEFAULT 'Radiology Staff' NOT NULL,
	"report_number" varchar(50) NOT NULL,
	"service_type" varchar(50) DEFAULT 'XRAY' NOT NULL,
	"examination" varchar(255) NOT NULL,
	"status" varchar(30) DEFAULT 'IN_PROGRESS' NOT NULL,
	"clinical_findings" text NOT NULL,
	"impression" text NOT NULL,
	"recommendation" text,
	"technician_notes" text,
	"report_date" timestamp DEFAULT now() NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "radiology_reports_report_number_unique" UNIQUE("report_number")
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "radiology_reports" ADD CONSTRAINT "radiology_reports_radiology_order_id_radiology_orders_id_fk" FOREIGN KEY ("radiology_order_id") REFERENCES "public"."radiology_orders"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "radiology_reports" ADD CONSTRAINT "radiology_reports_visit_id_patient_visits_id_fk" FOREIGN KEY ("visit_id") REFERENCES "public"."patient_visits"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "radiology_reports" ADD CONSTRAINT "radiology_reports_patient_id_patients_id_fk" FOREIGN KEY ("patient_id") REFERENCES "public"."patients"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "radiology_reports" ADD CONSTRAINT "radiology_reports_technician_id_users_id_fk" FOREIGN KEY ("technician_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
