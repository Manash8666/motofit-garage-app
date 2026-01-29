import { connect, Connection } from '@tidbcloud/serverless';
import dotenv from 'dotenv';

dotenv.config();

// Build connection URL from individual env vars if TIDB_CONNECTION_STRING is not set
function getConnectionUrl(): string {
    if (process.env.TIDB_CONNECTION_STRING) {
        return process.env.TIDB_CONNECTION_STRING;
    }

    const host = process.env.TIDB_HOST;
    const user = process.env.TIDB_USER;
    const password = process.env.TIDB_PASSWORD;
    const database = process.env.TIDB_DATABASE || 'test';
    const port = process.env.TIDB_PORT || '4000';

    if (!host || !user || !password) {
        throw new Error('TiDB connection not configured. Set TIDB_HOST, TIDB_USER, TIDB_PASSWORD');
    }

    return `mysql://${user}:${password}@${host}:${port}/${database}?ssl={"rejectUnauthorized":true}`;
}

// Get serverless connection
let conn: Connection | null = null;

export function getConnection(): Connection {
    if (!conn) {
        conn = connect({ url: getConnectionUrl() });
    }
    return conn;
}

// Helper function for executing queries
export async function query<T = any>(sql: string, params?: any[]): Promise<T[]> {
    const connection = getConnection();
    const result = await connection.execute(sql, params);
    return result as T[];
}

// Helper function for single row queries
export async function queryOne<T = any>(sql: string, params?: any[]): Promise<T | null> {
    const rows = await query<T>(sql, params);
    return rows.length > 0 ? rows[0] : null;
}

// Test database connection
export async function testConnection(): Promise<boolean> {
    try {
        await query('SELECT 1');
        console.log('✅ TiDB connection successful');
        return true;
    } catch (error) {
        console.error('❌ TiDB connection failed:', error);
        return false;
    }
}
