CREATE TABLE IF NOT EXISTS "patient_visits" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"patient_id" uuid NOT NULL,
	"visit_number" varchar(50) NOT NULL,
	"visit_date" timestamp DEFAULT now() NOT NULL,
	"status" varchar(50) DEFAULT 'REGISTERED' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "patient_visits_visit_number_unique" UNIQUE("visit_number")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "patients" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"mr_number" varchar(50) NOT NULL,
	"first_name" varchar(100) NOT NULL,
	"last_name" varchar(100) NOT NULL,
	"father_husband_name" varchar(150) NOT NULL,
	"gender" varchar(20) NOT NULL,
	"date_of_birth" date,
	"age" integer,
	"marital_status" varchar(20),
	"mobile_number" varchar(20) NOT NULL,
	"alternate_mobile_number" varchar(20),
	"address" text NOT NULL,
	"city" varchar(100) DEFAULT 'Sargodha' NOT NULL,
	"cnic" varchar(20),
	"blood_group" varchar(10),
	"allergies" text,
	"chronic_diseases" text,
	"remarks" text,
	"is_active" boolean DEFAULT true NOT NULL,
	"is_deleted" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "patients_mr_number_unique" UNIQUE("mr_number")
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "patient_visits" ADD CONSTRAINT "patient_visits_patient_id_patients_id_fk" FOREIGN KEY ("patient_id") REFERENCES "public"."patients"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
