DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'trips' 
        AND column_name = 'starting_point'
    ) THEN
        ALTER TABLE "trips" ADD COLUMN "starting_point" text NOT NULL;
    END IF;
END $$;