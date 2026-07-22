CREATE TABLE IF NOT EXISTS "patient_operations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"operation_order_id" uuid,
	"visit_id" uuid NOT NULL,
	"patient_id" uuid NOT NULL,
	"doctor_id" uuid NOT NULL,
	"doctor_name" varchar(150) NOT NULL,
	"operation_number" varchar(50) NOT NULL,
	"operation_name" varchar(255) NOT NULL,
	"operation_charges" numeric(10, 2) DEFAULT '20000.00' NOT NULL,
	"urgency" varchar(30) DEFAULT 'ELECTIVE' NOT NULL,
	"status" varchar(30) DEFAULT 'PENDING' NOT NULL,
	"notes" text,
	"operation_date" timestamp DEFAULT now() NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "patient_operations_operation_number_unique" UNIQUE("operation_number")
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "patient_operations" ADD CONSTRAINT "patient_operations_operation_order_id_operation_orders_id_fk" FOREIGN KEY ("operation_order_id") REFERENCES "public"."operation_orders"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "patient_operations" ADD CONSTRAINT "patient_operations_visit_id_patient_visits_id_fk" FOREIGN KEY ("visit_id") REFERENCES "public"."patient_visits"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "patient_operations" ADD CONSTRAINT "patient_operations_patient_id_patients_id_fk" FOREIGN KEY ("patient_id") REFERENCES "public"."patients"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "patient_operations" ADD CONSTRAINT "patient_operations_doctor_id_doctors_id_fk" FOREIGN KEY ("doctor_id") REFERENCES "public"."doctors"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
