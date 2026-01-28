/**
 * Security Update Migration
 * Adds: allowed_ips column to users table for IP Whitelisting
 * Run with: npx tsx src/db/migrate-security.ts
 */
import { getPool } from './tidb';

async function runMigration() {
    console.log('🚀 Starting Security Migration...\n');

    try {
        const pool = getPool();

        console.log('  Checking users table...');

        // Add allowed_ips column to users table
        // Format: Comma-separated list of IPs (e.g., "192.168.1.1,10.0.0.1")
        // If NULL or empty string, ALL IPs are allowed (default behavior)
        try {
            await pool.execute(`ALTER TABLE users ADD COLUMN allowed_ips TEXT DEFAULT NULL`);
            console.log('  ✓ Added allowed_ips to users table');
        } catch (e: any) {
            if (e.code === 'ER_DUP_FIELDNAME' || e.message?.includes('Duplicate')) {
                console.log('  ✓ allowed_ips already exists');
            } else {
                console.log('  ⚠ Could not add allowed_ips:', e.message);
                throw e; // Critical failure if we can't add security column
            }
        }

        console.log('\n✅ Security migration completed successfully!\n');
        process.exit(0);
    } catch (error) {
        console.error('❌ Migration failed:', error);
        process.exit(1);
    }
}

runMigration();
