/**
 * Direct MySQL2 script to create all tables in TiDB
 * Run with: node scripts/create-tables-mysql2.js
 */
require('dotenv').config();

const mysql = require('mysql2/promise');

async function createTables() {
    const config = {
        host: process.env.TIDB_HOST,
        port: parseInt(process.env.TIDB_PORT || '4000'),
        user: process.env.TIDB_USER,
        password: process.env.TIDB_PASSWORD,
        database: process.env.TIDB_DATABASE || 'test',
        ssl: {
            rejectUnauthorized: true
        }
    };

    console.log('📋 Connection config:');
    console.log(`   Host: ${config.host}`);
    console.log(`   Port: ${config.port}`);
    console.log(`   User: ${config.user}`);
    console.log(`   Database: ${config.database}`);
    console.log('');

    try {
        const connection = await mysql.createConnection(config);
        console.log('🔗 Connected to TiDB');
        console.log('📊 Creating tables...\n');

        const tables = [
            {
                name: 'customers',
                sql: `CREATE TABLE IF NOT EXISTS customers (
                    id VARCHAR(50) PRIMARY KEY,
                    name VARCHAR(255) NOT NULL,
                    phone VARCHAR(20),
                    email VARCHAR(255),
                    address TEXT,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
                )`
            },
            {
                name: 'bikes',
                sql: `CREATE TABLE IF NOT EXISTS bikes (
                    id VARCHAR(50) PRIMARY KEY,
                    customer_id VARCHAR(50),
                    make VARCHAR(100),
                    model VARCHAR(100),
                    year INT,
                    registration_no VARCHAR(50),
                    color VARCHAR(50),
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )`
            },
            {
                name: 'services',
                sql: `CREATE TABLE IF NOT EXISTS services (
                    id VARCHAR(50) PRIMARY KEY,
                    name VARCHAR(255) NOT NULL,
                    description TEXT,
                    price DECIMAL(10, 2) DEFAULT 0,
                    duration INT DEFAULT 60,
                    category VARCHAR(100) DEFAULT 'General',
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )`
            },
            {
                name: 'jobs',
                sql: `CREATE TABLE IF NOT EXISTS jobs (
                    id VARCHAR(50) PRIMARY KEY,
                    job_no VARCHAR(50),
                    customer_id VARCHAR(50),
                    vehicle_id VARCHAR(50),
                    status VARCHAR(20) DEFAULT 'pending',
                    priority VARCHAR(20) DEFAULT 'normal',
                    services JSON,
                    total_amount DECIMAL(10, 2) DEFAULT 0,
                    notes TEXT,
                    assigned_to VARCHAR(50),
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                    completed_at TIMESTAMP NULL
                )`
            },
            {
                name: 'payments',
                sql: `CREATE TABLE IF NOT EXISTS payments (
                    id VARCHAR(50) PRIMARY KEY,
                    job_id VARCHAR(50),
                    customer_id VARCHAR(50),
                    amount DECIMAL(10, 2) NOT NULL,
                    method VARCHAR(20) DEFAULT 'cash',
                    status VARCHAR(20) DEFAULT 'completed',
                    reference_no VARCHAR(100),
                    notes TEXT,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )`
            },
            {
                name: 'inventory',
                sql: `CREATE TABLE IF NOT EXISTS inventory (
                    id VARCHAR(50) PRIMARY KEY,
                    name VARCHAR(255) NOT NULL,
                    category VARCHAR(100),
                    stock INT DEFAULT 0,
                    min_stock INT DEFAULT 5,
                    price DECIMAL(10, 2) DEFAULT 0,
                    location VARCHAR(50),
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
                )`
            },
            {
                name: 'mechanics',
                sql: `CREATE TABLE IF NOT EXISTS mechanics (
                    id VARCHAR(50) PRIMARY KEY,
                    name VARCHAR(255) NOT NULL,
                    specialty VARCHAR(100),
                    phone VARCHAR(20),
                    status VARCHAR(20) DEFAULT 'active',
                    efficiency INT DEFAULT 80,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )`
            }
        ];

        for (const table of tables) {
            try {
                await connection.execute(table.sql);
                console.log(`✅ ${table.name} table created/verified`);
            } catch (error) {
                console.error(`❌ ${table.name} error:`, error.message);
            }
        }

        // Verify tables exist
        console.log('\n📋 Verifying tables...');
        const [rows] = await connection.execute('SHOW TABLES');
        console.log('Tables in database:', rows.map(r => Object.values(r)[0]).join(', '));

        await connection.end();
        console.log('\n🎉 Done!');

    } catch (error) {
        console.error('❌ Connection error:', error.message);
        console.error('Full error:', error);
    }
}

createTables();
