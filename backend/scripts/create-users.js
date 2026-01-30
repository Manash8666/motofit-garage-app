/**
 * Script to seed specific users into TiDB
 * Run: node create-users.js
 */
const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
require('dotenv').config();

const USERS = [
    { name: 'Akshat Mohanty', username: 'akshat', role: 'Owner', email: 'akshat@motofit.com' },
    { name: 'Munna Gujili', username: 'munna', role: 'Senior Head Mechanic', email: 'munna@motofit.com' },
    { name: 'Goarav Thakor', username: 'goarav', role: 'Mid-Tier Mechanic', email: 'goarav@motofit.com' },
    { name: 'Kunal Thakor', username: 'kunal', role: 'Junior Mechanic', email: 'kunal@motofit.com' },
    { name: 'Samael Morningstar', username: 'samael', role: 'Admin', email: 'samael@motofit.com' },
];

const DEFAULT_PASSWORD = 'Motofit@2026';

async function seedUsers() {
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

        // ensure table exists
        await connection.execute(`
            CREATE TABLE IF NOT EXISTS users (
                id VARCHAR(36) PRIMARY KEY,
                username VARCHAR(255) UNIQUE NOT NULL,
                password_hash VARCHAR(255),
                role VARCHAR(50) DEFAULT 'User',
                email VARCHAR(255),
                phone VARCHAR(20),
                full_name VARCHAR(255),
                allowed_ips TEXT,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        `);

        // Add full_name column if checks fail (idempotent)
        try { await connection.execute('ALTER TABLE users ADD COLUMN full_name VARCHAR(255)'); } catch (e) { }


        console.log('🔒 Hashing default password...');
        const passwordHash = await bcrypt.hash(DEFAULT_PASSWORD, 10);

        for (const user of USERS) {
            const userId = crypto.randomUUID();

            // Check if user exists
            const [existing] = await connection.execute('SELECT * FROM users WHERE username = ?', [user.username]);

            if (existing.length > 0) {
                console.log(`🔄 Updating ${user.name} (${user.username})...`);
                await connection.execute(
                    'UPDATE users SET password_hash = ?, email = ?, role = ?, full_name = ? WHERE username = ?',
                    [passwordHash, user.email, user.role, user.name, user.username]
                );
            } else {
                console.log(`➕ Creating ${user.name} (${user.username})...`);
                await connection.execute(
                    'INSERT INTO users (id, username, password_hash, role, email, full_name) VALUES (?, ?, ?, ?, ?, ?)',
                    [userId, user.username, passwordHash, user.role, user.email, user.name]
                );
            }
        }

        // Remove Demo/Old Users if strictly needed, but let's keep it safe by only deleting 'admin' if it exists and isn't in our list
        await connection.execute("DELETE FROM users WHERE username = 'admin'");
        console.log('🗑️  Removed demo admin user.');

        console.log('\n🎉 All users seeded successfully!');
        console.log(`🔑 Default Password for all: ${DEFAULT_PASSWORD}`);

    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        if (connection) await connection.end();
        process.exit(0);
    }
}

seedUsers();
