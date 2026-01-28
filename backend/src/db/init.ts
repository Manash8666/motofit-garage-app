import { getPool, testConnection } from './tidb';
import fs from 'fs/promises';
import path from 'path';

/**
 * Initialize TiDB database with schema
 */
export async function initializeDatabase(): Promise<void> {
    console.log('🚀 Starting database initialization...\n');

    // Test connection first
    const connected = await testConnection();
    if (!connected) {
        throw new Error('Failed to connect to TiDB. Please check your credentials.');
    }

    // Read schema file
    const schemaPath = path.join(__dirname, 'schema.sql');
    console.log('📖 Reading schema file...');
    const schemaContent = await fs.readFile(schemaPath, 'utf-8');

    // Remove comments and split by semicolon
    const cleanedSchema = schemaContent
        .split('\n')
        .filter(line => !line.trim().startsWith('--') && line.trim().length > 0)
        .join('\n');

    // Split into statements - improved logic
    const statements = cleanedSchema
        .split(';')
        .map(s => s.trim())
        .filter(s => s.length > 10); // Filter out empty or very short statements

    const pool = getPool();
    let successCount = 0;
    let errorCount = 0;

    console.log(`📝 Found ${statements.length} SQL statements to execute\n`);

    for (let i = 0; i < statements.length; i++) {
        const statement = statements[i];
        const statementPreview = statement.substring(0, 50).replace(/\n/g, ' ') + '...';

        try {
            await pool.execute(statement);
            successCount++;
            console.log(`✅ [${i + 1}/${statements.length}] ${statementPreview}`);
        } catch (error: any) {
            // Ignore "already exists" errors
            if (error.message.includes('already exists') || error.code === 'ER_TABLE_EXISTS_ERROR') {
                console.log(`⚠️  [${i + 1}/${statements.length}] Table already exists (skipped)`);
                successCount++;
            } else {
                console.error(`❌ [${i + 1}/${statements.length}] Failed:`, error.message);
                errorCount++;
            }
        }
    }

    console.log(`\n✅ Database initialization complete!`);
    console.log(`   Success: ${successCount} | Errors: ${errorCount} | Total: ${statements.length}`);
}

/**
 * Check if database is initialized
 */
export async function isDatabaseInitialized(): Promise<boolean> {
    try {
        const pool = getPool();
        const [rows] = await pool.execute('SHOW TABLES');
        return Array.isArray(rows) && rows.length > 0;
    } catch (error) {
        return false;
    }
}

// Run initialization if called directly
if (require.main === module) {
    initializeDatabase()
        .then(() => {
            console.log('\n🎉 Database ready!');
            process.exit(0);
        })
        .catch((error) => {
            console.error('\n💥 Initialization failed:', error);
            process.exit(1);
        });
}
