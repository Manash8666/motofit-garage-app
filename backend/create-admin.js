/**
 * Script to create/update default admin user in TiDB
 * Run: node create-admin.js
 */
const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
require('dotenv').config();

async function createAdminUser() {
    let connection;
    try {
        console.log('🔌 Connecting to TiDB...');

        const config = {
            host: process.env.TIDB_HOST,
            port: parseInt(process.env.TIDB_PORT || '4000'),
            user: process.env.TIDB_USER,
            password: process.env.TIDB_PASSWORD,
            database: process.env.TIDB_DATABASE || 'test',
            ssl: {
                minVersion: 'TLSv1.2',
                rejectUnauthorized: true
            }
        };

        connection = await mysql.createConnection(config);
        console.log('✅ Connected.');

        // 1. Ensure Table Exists
        await connection.execute(`
            CREATE TABLE IF NOT EXISTS users (
                id VARCHAR(36) PRIMARY KEY,
                username VARCHAR(255) UNIQUE NOT NULL,
                password_hash VARCHAR(255),
                role VARCHAR(50) DEFAULT 'User',
                email VARCHAR(255),
                allowed_ips TEXT,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        `);

        // 2. Hash Password
        const passwordHash = await bcrypt.hash('123', 10);
        const adminId = crypto.randomUUID();

        // 3. Upsert Admin
        const [existing] = await connection.execute('SELECT * FROM users WHERE username = ?', ['admin']);

        if (existing.length > 0) {
            console.log('🔄 Updating existing admin user password...');
            await connection.execute(
                'UPDATE users SET password_hash = ? WHERE username = ?',
                [passwordHash, 'admin']
            );
        } else {
            console.log('➕ Creating new admin user...');
            await connection.execute(
                'INSERT INTO users (id, username, role, email, password_hash) VALUES (?, ?, ?, ?, ?)',
                [adminId, 'admin', 'Owner', 'admin@motofit.com', passwordHash]
            );
        }

        console.log('✅ Admin user ready!');
        console.log('   Username: admin');
        console.log('   Password: 123');
        console.log('   Role: Owner');

    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        if (connection) await connection.end();
        process.exit(0);
    }
}

createAdminUser();
