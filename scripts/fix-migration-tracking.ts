import postgres from 'postgres';
import 'dotenv/config';
import { readFileSync } from 'fs';
import { join } from 'path';
import { createHash } from 'crypto';

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL environment variable is not set');
}

const client = postgres(process.env.DATABASE_URL, { max: 1 });

async function fixMigrationTracking() {
  console.log('🔍 Checking migration status...\n');
  
  try {
    // Check if trips table exists
    const tripsTableExists = await client`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'trips'
      );
    `;
    
    console.log(`📊 Trips table exists: ${tripsTableExists[0].exists}`);
    
    if (!tripsTableExists[0].exists) {
      console.log('❌ Trips table does not exist. Please run migrations from the beginning.');
      await client.end();
      process.exit(1);
    }
    
    // Check if starting_point column exists
    const startingPointColumnExists = await client`
      SELECT EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'trips' 
        AND column_name = 'starting_point'
      );
    `;
    
    console.log(`📊 Starting_point column exists: ${startingPointColumnExists[0].exists}`);
    
    let startingPointNullable = false;
    if (startingPointColumnExists[0].exists) {
      // Check if it's nullable
      const columnInfo = await client`
        SELECT is_nullable 
        FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'trips' 
        AND column_name = 'starting_point';
      `;
      startingPointNullable = columnInfo[0].is_nullable === 'YES';
      console.log(`📊 Starting_point is nullable: ${startingPointNullable}`);
    }
    
    // Apply missing migrations manually
    console.log('\n🔧 Applying missing migrations...\n');
    
    // Migration 0002: Add starting_point column if it doesn't exist
    if (!startingPointColumnExists[0].exists) {
      console.log('  ➕ Applying migration 0002: Adding starting_point column...');
      try {
        await client`
          ALTER TABLE "trips" ADD COLUMN "starting_point" text NOT NULL DEFAULT '';
        `;
        // Remove default after adding
        await client`
          ALTER TABLE "trips" ALTER COLUMN "starting_point" DROP DEFAULT;
        `;
        console.log('  ✅ Migration 0002 applied');
      } catch (error: any) {
        console.log(`  ⚠️  Migration 0002 failed: ${error.message}`);
      }
    } else {
      console.log('  ✅ Migration 0002 already applied (starting_point column exists)');
    }
    
    // Migration 0003: Make starting_point nullable if it's not already
    if (startingPointColumnExists[0].exists && !startingPointNullable) {
      console.log('  ➕ Applying migration 0003: Making starting_point nullable...');
      try {
        await client`
          ALTER TABLE "trips" ALTER COLUMN "starting_point" DROP NOT NULL;
        `;
        console.log('  ✅ Migration 0003 applied');
      } catch (error: any) {
        console.log(`  ⚠️  Migration 0003 failed: ${error.message}`);
      }
    } else if (startingPointColumnExists[0].exists && startingPointNullable) {
      console.log('  ✅ Migration 0003 already applied (starting_point is nullable)');
    }
    
    // Now mark migrations as applied in the tracking table
    console.log('\n📝 Updating migration tracking...\n');
    
    // Read migration files and compute their hashes (Drizzle uses SHA-256)
    const migrationFiles = [
      { file: '0000_purple_obadiah_stane.sql', timestamp: 1762552918133 },
      { file: '0001_cute_whiplash.sql', timestamp: 1762571150991 },
      { file: '0002_tricky_captain_marvel.sql', timestamp: 1762606054037 },
      { file: '0003_jazzy_jocasta.sql', timestamp: 1762607063976 },
    ];
    
    const migrationHashes: Array<{ hash: string; timestamp: number }> = [];
    
    for (const { file, timestamp } of migrationFiles) {
      try {
        const content = readFileSync(join(__dirname, '..', 'drizzle', file), 'utf-8');
        // Drizzle uses SHA-256 hash of the file content
        const hash = createHash('sha256').update(content).digest('hex');
        migrationHashes.push({ hash, timestamp });
        console.log(`  📄 ${file}: ${hash.substring(0, 16)}...`);
      } catch (error) {
        console.log(`  ⚠️  Could not read ${file}`);
      }
    }
    
    // Check what migrations are currently tracked
    const trackedMigrations = await client`
      SELECT hash FROM drizzle.__drizzle_migrations;
    `;
    
    const trackedHashes = trackedMigrations.map((m: any) => m.hash);
    
    // Insert missing migrations
    // Drizzle uses bigint for created_at (Unix timestamp in milliseconds)
    for (const { hash, timestamp } of migrationHashes) {
      if (!trackedHashes.includes(hash)) {
        console.log(`  ➕ Marking migration as applied: ${hash.substring(0, 16)}...`);
        // Check if hash already exists (in case of race condition)
        const exists = await client`
          SELECT 1 FROM drizzle.__drizzle_migrations WHERE hash = ${hash};
        `;
        if (exists.length === 0) {
          await client`
            INSERT INTO drizzle.__drizzle_migrations (hash, created_at)
            VALUES (${hash}, ${timestamp});
          `;
        } else {
          console.log(`  ⚠️  Migration already exists: ${hash.substring(0, 16)}...`);
        }
      } else {
        console.log(`  ✅ Migration already tracked: ${hash.substring(0, 16)}...`);
      }
    }
    
    console.log('\n✅ Migration tracking fixed!');
    console.log('🚀 You can now run: npx drizzle-kit migrate');
    
  } catch (error: any) {
    console.error('❌ Error:', error.message);
    console.error(error);
  } finally {
    await client.end();
    process.exit(0);
  }
}

fixMigrationTracking().catch((error) => {
  console.error('❌ Script failed:', error);
  process.exit(1);
});

