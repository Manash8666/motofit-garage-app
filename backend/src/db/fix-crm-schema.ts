/**
 * Fix CRM Schema Migration
 * Adds missing columns identified in route audits
 * Run with: npx tsx src/db/fix-crm-schema.ts
 */
import { getPool } from './tidb';

const SCHEMA_FIXES = [
    // Fix leads table - add converted_customer_id
    `ALTER TABLE leads ADD COLUMN IF NOT EXISTS converted_customer_id CHAR(36)`,

    // Fix payments table - add updated_at (some DBs don't support IF NOT EXISTS on columns)
    // We'll use a safe approach
];

async function runFixes() {
    console.log('🔧 Running CRM Schema Fixes...\n');

    try {
        const pool = getPool();

        // Check and add converted_customer_id to leads
        console.log('  Checking leads table...');
        try {
            await pool.execute(`ALTER TABLE leads ADD COLUMN converted_customer_id CHAR(36)`);
            console.log('  ✓ Added converted_customer_id to leads');
        } catch (e: any) {
            if (e.code === 'ER_DUP_FIELDNAME' || e.message?.includes('Duplicate')) {
                console.log('  ✓ converted_customer_id already exists');
            } else {
                console.log('  ⚠ Could not add converted_customer_id:', e.message);
            }
        }

        // Check and add updated_at to payments
        console.log('  Checking payments table...');
        try {
            await pool.execute(`ALTER TABLE payments ADD COLUMN updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP`);
            console.log('  ✓ Added updated_at to payments');
        } catch (e: any) {
            if (e.code === 'ER_DUP_FIELDNAME' || e.message?.includes('Duplicate')) {
                console.log('  ✓ updated_at already exists');
            } else {
                console.log('  ⚠ Could not add updated_at:', e.message);
            }
        }

        console.log('\n✅ Schema fixes completed!\n');
        process.exit(0);
    } catch (error) {
        console.error('❌ Fix failed:', error);
        process.exit(1);
    }
}

runFixes();
