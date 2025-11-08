CREATE TABLE IF NOT EXISTS "trip_insights" (
	"id" text PRIMARY KEY NOT NULL,
	"trip_id" text NOT NULL,
	"insights_data" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_schema = 'public' 
        AND table_name = 'trip_insights' 
        AND constraint_name = 'trip_insights_trip_id_trips_id_fk'
    ) THEN
        ALTER TABLE "trip_insights" ADD CONSTRAINT "trip_insights_trip_id_trips_id_fk" FOREIGN KEY ("trip_id") REFERENCES "public"."trips"("id") ON DELETE cascade ON UPDATE no action;
    END IF;
END $$;
