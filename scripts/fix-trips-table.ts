import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import 'dotenv/config';

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL environment variable is not set');
}

const client = postgres(process.env.DATABASE_URL, { max: 1 });
const db = drizzle(client);

async function fixTripsTable() {
  console.log('🔧 Dropping old trips table...');
  
  try {
    await db.execute(`DROP TABLE IF EXISTS "trips";`);
    console.log('✅ Old table dropped');
  } catch (error) {
    console.log('ℹ️ Table did not exist or error:', error);
  }

  console.log('🔨 Creating new trips table...');
  
  await db.execute(`
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
  `);
  
  console.log('✅ New table created');
  
  console.log('🔗 Adding foreign key constraint...');
  await db.execute(`
    ALTER TABLE "trips" 
    ADD CONSTRAINT "trips_user_id_user_id_fk" 
    FOREIGN KEY ("user_id") 
    REFERENCES "public"."user"("id") 
    ON DELETE cascade 
    ON UPDATE no action;
  `);
  
  console.log('✅ Foreign key added');
  console.log('🎉 Migration complete!');
  
  await client.end();
  process.exit(0);
}

fixTripsTable().catch((error) => {
  console.error('❌ Migration failed:', error);
  process.exit(1);
});
