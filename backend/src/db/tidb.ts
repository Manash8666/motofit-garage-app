import mysql from 'mysql2/promise';
import { connect } from '@tidbcloud/serverless';
import dotenv from 'dotenv';

dotenv.config();

// TiDB connection configuration
const config = {
    host: process.env.TIDB_HOST,
    port: parseInt(process.env.TIDB_PORT || '4000'),
    user: process.env.TIDB_USER,
    password: process.env.TIDB_PASSWORD,
    database: process.env.TIDB_DATABASE || 'motofit',
    ssl: {
        minVersion: 'TLSv1.2',
        rejectUnauthorized: true
    },
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
};

// Connection pool for traditional MySQL protocol
let pool: mysql.Pool | null = null;

export function getPool(): mysql.Pool {
    if (!pool) {
        pool = mysql.createPool(config);
    }
    return pool;
}

// Export pool getter for route files
export { pool };

// TiDB Cloud Serverless connection (alternative method)
export function getTiDBServerless() {
    if (!process.env.TIDB_CONNECTION_STRING) {
        throw new Error('TIDB_CONNECTION_STRING not configured');
    }
    return connect({ url: process.env.TIDB_CONNECTION_STRING });
}

// Helper function for executing queries
export async function query<T = any>(sql: string, params?: any[]): Promise<T[]> {
    const connection = getPool();
    const [rows] = await connection.execute(sql, params);
    return rows as T[];
}

// Helper function for single row queries
export async function queryOne<T = any>(sql: string, params?: any[]): Promise<T | null> {
    const rows = await query<T>(sql, params);
    return rows.length > 0 ? rows[0] : null;
}

// Test database connection
export async function testConnection(): Promise<boolean> {
    try {
        const connection = getPool();
        await connection.execute('SELECT 1');
        console.log('✅ TiDB connection successful');
        return true;
    } catch (error) {
        console.error('❌ TiDB connection failed:', error);
        return false;
    }
}

// Graceful shutdown
export async function closeConnection(): Promise<void> {
    if (pool) {
        await pool.end();
        pool = null;
        console.log('TiDB connection pool closed');
    }
}
