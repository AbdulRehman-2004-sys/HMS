CREATE TABLE IF NOT EXISTS "billing_charges" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"visit_id" uuid NOT NULL,
	"patient_id" uuid NOT NULL,
	"source_module" varchar(50) DEFAULT 'ADMISSION' NOT NULL,
	"source_id" uuid NOT NULL,
	"item_description" varchar(255) NOT NULL,
	"amount" numeric(10, 2) NOT NULL,
	"is_paid" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "patient_admissions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"admission_order_id" uuid NOT NULL,
	"visit_id" uuid NOT NULL,
	"patient_id" uuid NOT NULL,
	"admitted_by_id" uuid,
	"admitted_by_name" varchar(150) DEFAULT 'Reception Staff' NOT NULL,
	"admission_number" varchar(50) NOT NULL,
	"room_name" varchar(150) NOT NULL,
	"room_charges" numeric(10, 2) DEFAULT '5000.00' NOT NULL,
	"status" varchar(30) DEFAULT 'ADMITTED' NOT NULL,
	"notes" text,
	"admission_date" timestamp DEFAULT now() NOT NULL,
	"discharge_date" timestamp,
	"discharged_by_id" uuid,
	"discharged_by_name" varchar(150),
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "patient_admissions_admission_number_unique" UNIQUE("admission_number")
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "billing_charges" ADD CONSTRAINT "billing_charges_visit_id_patient_visits_id_fk" FOREIGN KEY ("visit_id") REFERENCES "public"."patient_visits"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "billing_charges" ADD CONSTRAINT "billing_charges_patient_id_patients_id_fk" FOREIGN KEY ("patient_id") REFERENCES "public"."patients"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "patient_admissions" ADD CONSTRAINT "patient_admissions_admission_order_id_admission_orders_id_fk" FOREIGN KEY ("admission_order_id") REFERENCES "public"."admission_orders"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "patient_admissions" ADD CONSTRAINT "patient_admissions_visit_id_patient_visits_id_fk" FOREIGN KEY ("visit_id") REFERENCES "public"."patient_visits"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "patient_admissions" ADD CONSTRAINT "patient_admissions_patient_id_patients_id_fk" FOREIGN KEY ("patient_id") REFERENCES "public"."patients"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "patient_admissions" ADD CONSTRAINT "patient_admissions_admitted_by_id_users_id_fk" FOREIGN KEY ("admitted_by_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "patient_admissions" ADD CONSTRAINT "patient_admissions_discharged_by_id_users_id_fk" FOREIGN KEY ("discharged_by_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
