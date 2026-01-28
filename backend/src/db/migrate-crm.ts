/**
 * CRM & Accounting Migration Script
 * Adds: quotes, quote_items, payments, leads, transactions, transaction_categories
 * Run with: npx tsx src/db/migrate-crm.ts
 */
import { getPool } from './tidb';

// Individual CREATE TABLE statements
const TABLE_STATEMENTS = [
    // Transaction Categories first (referenced by transactions)
    `CREATE TABLE IF NOT EXISTS transaction_categories (
        id CHAR(36) PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        type ENUM('income', 'expense') NOT NULL,
        description VARCHAR(255),
        is_active BOOLEAN DEFAULT TRUE
    )`,

    // Quotes Table
    `CREATE TABLE IF NOT EXISTS quotes (
        id CHAR(36) PRIMARY KEY,
        quote_no VARCHAR(50) UNIQUE NOT NULL,
        customer_id CHAR(36),
        customer_name VARCHAR(255),
        customer_phone VARCHAR(20),
        customer_email VARCHAR(255),
        vehicle_info VARCHAR(255),
        status ENUM('draft', 'sent', 'accepted', 'rejected', 'converted') DEFAULT 'draft',
        subtotal DECIMAL(12,2) DEFAULT 0,
        discount DECIMAL(12,2) DEFAULT 0,
        total DECIMAL(12,2) DEFAULT 0,
        valid_until DATE,
        notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )`,

    // Quote Items Table
    `CREATE TABLE IF NOT EXISTS quote_items (
        id CHAR(36) PRIMARY KEY,
        quote_id CHAR(36) NOT NULL,
        service_id CHAR(36),
        description VARCHAR(255) NOT NULL,
        quantity INT DEFAULT 1,
        unit_price DECIMAL(12,2) NOT NULL,
        total DECIMAL(12,2) NOT NULL,
        FOREIGN KEY (quote_id) REFERENCES quotes(id) ON DELETE CASCADE
    )`,

    // Payments Table
    `CREATE TABLE IF NOT EXISTS payments (
        id CHAR(36) PRIMARY KEY,
        payment_no VARCHAR(50) UNIQUE NOT NULL,
        job_id CHAR(36),
        invoice_id CHAR(36),
        customer_id CHAR(36),
        customer_name VARCHAR(255),
        amount DECIMAL(12,2) NOT NULL,
        payment_method ENUM('cash', 'upi', 'card', 'bank_transfer', 'other') DEFAULT 'cash',
        payment_date DATE NOT NULL,
        reference_no VARCHAR(100),
        notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`,

    // Leads Table (CRM)
    `CREATE TABLE IF NOT EXISTS leads (
        id CHAR(36) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        phone VARCHAR(20),
        email VARCHAR(255),
        vehicle_interest VARCHAR(255),
        source ENUM('walk_in', 'referral', 'social_media', 'advertisement', 'website', 'other') DEFAULT 'walk_in',
        status ENUM('new', 'contacted', 'qualified', 'converted', 'lost') DEFAULT 'new',
        assigned_to VARCHAR(255),
        notes TEXT,
        follow_up_date DATE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )`,

    // Transactions Table (Accounting Ledger)
    `CREATE TABLE IF NOT EXISTS transactions (
        id CHAR(36) PRIMARY KEY,
        transaction_no VARCHAR(50) UNIQUE NOT NULL,
        type ENUM('income', 'expense') NOT NULL,
        category_id CHAR(36),
        amount DECIMAL(12,2) NOT NULL,
        description VARCHAR(255),
        transaction_date DATE NOT NULL,
        reference_id CHAR(36),
        reference_type VARCHAR(50),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (category_id) REFERENCES transaction_categories(id) ON DELETE SET NULL
    )`,
];

const SEED_CATEGORIES = `INSERT IGNORE INTO transaction_categories (id, name, type, description) VALUES
    ('cat-income-service', 'Service Revenue', 'income', 'Income from repair services'),
    ('cat-income-parts', 'Parts Sales', 'income', 'Income from parts and accessories'),
    ('cat-income-labor', 'Labor Charges', 'income', 'Income from labor/mechanic work'),
    ('cat-income-other', 'Other Income', 'income', 'Miscellaneous income'),
    ('cat-expense-parts', 'Parts Purchase', 'expense', 'Cost of parts and spares'),
    ('cat-expense-salary', 'Salaries', 'expense', 'Employee salaries and wages'),
    ('cat-expense-rent', 'Rent', 'expense', 'Shop/workshop rent'),
    ('cat-expense-utilities', 'Utilities', 'expense', 'Electricity, water, internet'),
    ('cat-expense-maintenance', 'Maintenance', 'expense', 'Equipment maintenance'),
    ('cat-expense-other', 'Other Expenses', 'expense', 'Miscellaneous expenses')`;

async function runMigration() {
    console.log('🚀 Starting CRM & Accounting Migration...\n');

    try {
        const pool = getPool();
        const tableNames = ['transaction_categories', 'quotes', 'quote_items', 'payments', 'leads', 'transactions'];

        console.log(`📋 Creating ${TABLE_STATEMENTS.length} tables...\n`);

        for (let i = 0; i < TABLE_STATEMENTS.length; i++) {
            const stmt = TABLE_STATEMENTS[i];
            console.log(`  ✓ Creating ${tableNames[i]}...`);
            await pool.execute(stmt);
        }

        console.log('\n🌱 Seeding transaction categories...');
        await pool.execute(SEED_CATEGORIES);
        console.log('  ✓ Categories seeded\n');

        console.log('✅ Migration completed successfully!\n');
        console.log('New tables created:');
        tableNames.forEach(t => console.log(`  • ${t}`));
        console.log('');

        process.exit(0);
    } catch (error) {
        console.error('❌ Migration failed:', error);
        process.exit(1);
    }
}

runMigration();
