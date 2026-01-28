/**
 * Test script to create a default admin user for MotoFit
 * Run this after Parse Server is running: node create-admin.js
 */
const Parse = require('parse/node');
require('dotenv').config();

// Initialize Parse
Parse.initialize(
    process.env.PARSE_APP_ID || 'motofit-app',
    '',
    process.env.PARSE_MASTER_KEY || 'motofit-master-key'
);
Parse.serverURL = process.env.PARSE_SERVER_URL || 'http://localhost:5000/api/parse';

async function createAdminUser() {
    try {
        // Check if admin user already exists
        const query = new Parse.Query(Parse.User);
        query.equalTo('username', 'admin');
        const existingUser = await query.first({ useMasterKey: true });

        if (existingUser) {
            console.log('✅ Admin user already exists');
            console.log(`   Username: ${existingUser.get('username')}`);
            console.log(`   Role: ${existingUser.get('role')}`);
            return;
        }

        // Create new admin user
        const user = new Parse.User();
        user.set('username', 'admin');
        user.set('password', '123');
        user.set('email', 'admin@motofit.com');
        user.set('role', 'Owner');

        await user.signUp(null, { useMasterKey: true });

        console.log('✅ Admin user created successfully!');
        console.log('   Username: admin');
        console.log('   Password: 123');
        console.log('   Role: Owner');
        console.log('   Email: admin@motofit.com');
    } catch (error) {
        console.error('❌ Error creating admin user:', error.message);
    }
}

createAdminUser()
    .then(() => {
        console.log('\n🚀 You can now login to MotoFit!');
        process.exit(0);
    })
    .catch((error) => {
        console.error('Failed:', error);
        process.exit(1);
    });
