/**
 * Script to create/update owner user in TiDB
 * Run: node create-admin.js
 */
const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
require('dotenv').config();

async function createOwnerUser() {
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

        // Owner Details
        const ownerUsername = 'akshat';
        const ownerPassword = 'Motofit@2026';
        const ownerEmail = 'akshatmohanty@gmail.com';
        const ownerPhone = '+91-7259625881';

        // 1. Ensure Table Exists
        await connection.execute(`
            CREATE TABLE IF NOT EXISTS users (
                id VARCHAR(36) PRIMARY KEY,
                username VARCHAR(255) UNIQUE NOT NULL,
                password_hash VARCHAR(255),
                role VARCHAR(50) DEFAULT 'User',
                email VARCHAR(255),
                phone VARCHAR(20),
                allowed_ips TEXT,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        `);

        // Add phone column if it doesn't exist
        try {
            await connection.execute('ALTER TABLE users ADD COLUMN phone VARCHAR(20)');
        } catch (e) {
            // Column may already exist
        }

        // 2. Hash Password
        const passwordHash = await bcrypt.hash(ownerPassword, 10);
        const ownerId = crypto.randomUUID();

        // 3. Upsert Owner
        const [existing] = await connection.execute('SELECT * FROM users WHERE username = ?', [ownerUsername]);

        if (existing.length > 0) {
            console.log('🔄 Updating existing owner...');
            await connection.execute(
                'UPDATE users SET password_hash = ?, email = ?, phone = ?, role = ? WHERE username = ?',
                [passwordHash, ownerEmail, ownerPhone, 'Owner', ownerUsername]
            );
        } else {
            console.log('➕ Creating owner user...');
            await connection.execute(
                'INSERT INTO users (id, username, password_hash, role, email, phone) VALUES (?, ?, ?, ?, ?, ?)',
                [ownerId, ownerUsername, passwordHash, 'Owner', ownerEmail, ownerPhone]
            );
        }

        // 4. Delete demo admin if exists
        await connection.execute('DELETE FROM users WHERE username = ?', ['admin']);
        console.log('🗑️ Removed demo admin user.');

        console.log('');
        console.log('✅ Owner account ready!');
        console.log('   Username: akshat');
        console.log('   Password: Motofit@2026');
        console.log('   Email: akshatmohanty@gmail.com');
        console.log('   Role: Owner');

    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        if (connection) await connection.end();
        process.exit(0);
    }
}

createOwnerUser();
