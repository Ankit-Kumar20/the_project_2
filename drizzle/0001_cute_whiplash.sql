CREATE TABLE "trips" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"name" varchar(255) NOT NULL,
	"destinations" text NOT NULL,
	"start_date" varchar(50),
	"end_date" varchar(50),
	"travellers" varchar(255),
	"pace" varchar(50),
	"budget" varchar(255),
	"interests" text,
	"must_sees" text,
	"avoid" text,
	"mobility_constraints" text,
	"travel_modes" text,
	"trip_data" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "trips" ADD CONSTRAINT "trips_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;