import { query } from './tidb';

/**
 * Seed test data into TiDB for development/testing
 */
async function seedTestData() {
    console.log('🌱 Starting database seeding...\n');

    try {
        // 1. Create test customers
        console.log('👥 Creating test customers...');
        await query(`
      INSERT INTO customers (id, name, phone, email, address) VALUES
      ('cust-001', 'Rajesh Kumar', '+91-9876543210', 'rajesh@example.com', '123 MG Road, Bangalore'),
      ('cust-002', 'Priya Sharma', '+91-9876543211', 'priya@example.com', '456 Park Street, Mumbai'),
      ('cust-003', 'Amit Patel', '+91-9876543212', 'amit@example.com', '789 Lake View, Delhi')
      ON DUPLICATE KEY UPDATE name=VALUES(name)
    `);
        console.log('✅ 3 customers created\n');

        // 2. Create test bikes
        console.log('🏍️  Creating test bikes...');
        await query(`
      INSERT INTO bikes (id, customer_id, make, model, year, registration, chassis, engine, color, odometer) VALUES
      ('bike-001', 'cust-001', 'Royal Enfield', 'Classic 350', 2023, 'KA-01-AB-1234', 'RE350C2023001', 'RE350E001', 'Black', 5000),
      ('bike-002', 'cust-002', 'Honda', 'Activa 6G', 2022, 'MH-02-CD-5678', 'HA6G2022001', 'HA6GE001', 'Red', 12000),
      ('bike-003', 'cust-003', 'Yamaha', 'FZ-S V3', 2024, 'DL-03-EF-9012', 'YFZSV32024001', 'YFZSE001', 'Blue', 1500)
      ON DUPLICATE KEY UPDATE make=VALUES(make)
    `);
        console.log('✅ 3 bikes created\n');

        // 3. Create test jobs
        console.log('📋 Creating test jobs...');
        await query(`
      INSERT INTO jobs (
        id, job_no, date, customer_id, bike_id, phone, bike_model,
        registration, mechanic, estimated_cost, actual_cost, notes,
        status, priority, warranty
      ) VALUES
      (
        'job-001', 'JOB-2024-001', '2024-01-20', 'cust-001', 'bike-001',
        '+91-9876543210', 'Royal Enfield Classic 350', 'KA-01-AB-1234',
        'Vikram Singh', 3500.00, 3200.00, 'Regular service completed',
        'Completed', 'medium', false
      ),
      (
        'job-002', 'JOB-2024-002', '2024-01-22', 'cust-002', 'bike-002',
        '+91-9876543211', 'Honda Activa 6G', 'MH-02-CD-5678',
        'Amit Kumar', 8500.00, 0, 'Engine repair required - warranty claim',
        'Repairing', 'high', true
      ),
      (
        'job-003', 'JOB-2024-003', '2024-01-24', 'cust-003', 'bike-003',
        '+91-9876543212', 'Yamaha FZ-S V3', 'DL-03-EF-9012',
        'Rahul Sharma', 1200.00, 0, 'Brake pads replacement',
        'Pending', 'low', false
      )
      ON DUPLICATE KEY UPDATE job_no=VALUES(job_no)
    `);
        console.log('✅ 3 jobs created\n');

        // 4. Link services to jobs
        console.log('🔧 Linking services to jobs...');
        await query(`
      INSERT INTO job_services (id, job_id, service_id, quantity, price, notes) VALUES
      ('js-001', 'job-001', 'srv-1', 1, 500.00, 'Oil Change'),
      ('js-002', 'job-001', 'srv-3', 1, 800.00, 'Brake Service'),
      ('js-003', 'job-002', 'srv-2', 1, 5000.00, 'Engine Repair'),
      ('js-004', 'job-003', 'srv-3', 1, 800.00, 'Brake Service')
      ON DUPLICATE KEY UPDATE price=VALUES(price)
    `);
        console.log('✅ Job-Service mappings created\n');

        // 5. Create parts inventory
        console.log('📦 Creating parts inventory...');
        await query(`
      INSERT INTO parts (id, name, part_number, category, quantity, min_stock_level, price, supplier) VALUES
      ('part-001', 'Engine Oil 10W-40', 'EO-10W40-1L', 'Oils', 50, 10, 450.00, 'Castrol'),
      ('part-002', 'Brake Pads (Front)', 'BP-F-001', 'Brakes', 25, 5, 650.00, 'TVS'),
      ('part-003', 'Air Filter', 'AF-001', 'Filters', 30, 8, 250.00, 'K&N'),
      ('part-004', 'Spark Plug', 'SP-001', 'Ignition', 40, 10, 180.00, 'NGK'),
      ('part-005', 'Chain Sprocket Kit', 'CSK-001', 'Transmission', 15, 3, 1800.00, 'RK')
      ON DUPLICATE KEY UPDATE name=VALUES(name)
    `);
        console.log('✅ 5 parts added to inventory\n');

        // 6. Link parts to jobs
        console.log('🔩 Linking parts to jobs...');
        await query(`
      INSERT INTO job_parts (id, job_id, part_id, quantity, price) VALUES
      ('jp-001', 'job-001', 'part-001', 2, 450.00),
      ('jp-002', 'job-001', 'part-002', 1, 650.00),
      ('jp-003', 'job-003', 'part-002', 1, 650.00)
      ON DUPLICATE KEY UPDATE quantity=VALUES(quantity)
    `);
        console.log('✅ Job-Parts mappings created\n');

        // 7. Summary
        console.log('📊 Database Summary:');
        const [customers] = await query('SELECT COUNT(*) as count FROM customers');
        const [bikes] = await query('SELECT COUNT(*) as count FROM bikes');
        const [jobs] = await query('SELECT COUNT(*) as count FROM jobs');
        const [services] = await query('SELECT COUNT(*) as count FROM services');
        const [parts] = await query('SELECT COUNT(*) as count FROM parts');

        console.log(`   Customers: ${customers.count}`);
        console.log(`   Bikes: ${bikes.count}`);
        console.log(`   Jobs: ${jobs.count}`);
        console.log(`   Services: ${services.count}`);
        console.log(`   Parts: ${parts.count}`);

        console.log('\n🎉 Test data seeding complete!');
        process.exit(0);
    } catch (error) {
        console.error('❌ Seeding failed:', error);
        process.exit(1);
    }
}

// Run seeding
seedTestData();
