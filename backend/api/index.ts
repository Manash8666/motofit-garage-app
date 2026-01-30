import { VercelRequest, VercelResponse } from '@vercel/node';
import { connect } from '@tidbcloud/serverless';
import bcrypt from 'bcryptjs';

// Initialize TiDB connection
function getDb() {
    const host = process.env.TIDB_HOST;
    const user = process.env.TIDB_USER;
    const password = process.env.TIDB_PASSWORD;
    const database = process.env.TIDB_DATABASE || 'test';
    const port = process.env.TIDB_PORT || '4000';

    if (!host || !user || !password) {
        throw new Error('TiDB not configured');
    }

    // Use URL-safe SSL configuration for TiDB Cloud
    const url = `mysql://${encodeURIComponent(user)}:${encodeURIComponent(password)}@${host}:${port}/${database}`;
    return connect({ url });
}

// Simple URL router
export default async function handler(req: VercelRequest, res: VercelResponse) {
    // CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    const path = req.url?.split('?')[0] || '/';
    const method = req.method || 'GET';
    console.log(`[API] ${method} ${path}`);

    try {
        // Health check
        if (path === '/api/health' || path === '/api' || path === '/') {
            return res.json({
                status: 'ok',
                timestamp: new Date().toISOString(),
                message: 'MotoFit API is running'
            });
        }

        // DEBUG: Check environment variables (REMOVE AFTER DEBUGGING)
        if (path === '/api/debug/env' && method === 'GET') {
            return res.json({
                hasHost: !!process.env.TIDB_HOST,
                hasUser: !!process.env.TIDB_USER,
                hasPassword: !!process.env.TIDB_PASSWORD,
                hasDatabase: !!process.env.TIDB_DATABASE,
                host: process.env.TIDB_HOST?.substring(0, 10) + '...',
                user: process.env.TIDB_USER?.substring(0, 5) + '...',
                database: process.env.TIDB_DATABASE
            });
        }

        // Auth routes
        if (path === '/api/auth/login' && method === 'POST') {
            return await handleLogin(req, res);
        }
        if (path === '/api/auth/me' && method === 'GET') {
            return await handleGetMe(req, res);
        }

        // Jobs routes
        if (path === '/api/jobs') {
            if (method === 'GET') return await handleGetJobs(res);
            if (method === 'POST') return await handleCreateJob(req, res);
        }
        if (path.startsWith('/api/jobs/') && path.split('/').length === 4) {
            const id = path.split('/')[3];
            if (method === 'GET') return await handleGetJob(res, id);
            if (method === 'PUT') return await handleUpdateJob(req, res, id);
            if (method === 'DELETE') return await handleDeleteJob(res, id);
        }

        // Customers routes
        if (path === '/api/customers') {
            if (method === 'GET') return await handleGetCustomers(res);
            if (method === 'POST') return await handleCreateCustomer(req, res);
        }
        if (path.startsWith('/api/customers/') && path.split('/').length === 4) {
            const id = path.split('/')[3];
            if (method === 'PUT') return await handleUpdateCustomer(req, res, id);
            if (method === 'DELETE') return await handleDeleteCustomer(res, id);
        }

        // Services routes
        if (path === '/api/services') {
            if (method === 'GET') return await handleGetServices(res);
            if (method === 'POST') return await handleCreateService(req, res);
        }
        if (path.startsWith('/api/services/') && path.split('/').length === 4) {
            const id = path.split('/')[3];
            if (method === 'PUT') return await handleUpdateService(req, res, id);
            if (method === 'DELETE') return await handleDeleteService(res, id);
        }

        // Bikes routes
        if (path === '/api/bikes') {
            if (method === 'GET') return await handleGetBikes(res);
            if (method === 'POST') return await handleCreateBike(req, res);
        }
        if (path.startsWith('/api/bikes/') && path.split('/').length === 4) {
            const id = path.split('/')[3];
            if (method === 'PUT') return await handleUpdateBike(req, res, id);
            if (method === 'DELETE') return await handleDeleteBike(res, id);
        }

        // Payments routes
        if (path === '/api/payments') {
            if (method === 'GET') return await handleGetPayments(res);
            if (method === 'POST') return await handleCreatePayment(req, res);
        }
        if (path === '/api/payments/summary' && method === 'GET') {
            return await handleGetPaymentSummary(res);
        }

        // Quotes routes
        if (path === '/api/quotes') {
            if (method === 'GET') return await handleGetQuotes(res);
            if (method === 'POST') return await handleCreateQuote(req, res);
        }
        if (path.startsWith('/api/quotes/') && path.split('/').length === 4) {
            const id = path.split('/')[3];
            if (method === 'PUT') return await handleUpdateQuote(req, res, id);
            if (method === 'DELETE') return await handleDeleteQuote(res, id);
        }
        if (path.startsWith('/api/quotes/') && path.endsWith('/convert') && method === 'POST') {
            const id = path.split('/')[3];
            return await handleConvertQuote(req, res, id);
        }

        // Admin routes - Data Management
        if (path === '/api/admin/purge' && method === 'DELETE') {
            return await handlePurgeAllData(res);
        }
        if (path === '/api/admin/seed-demo' && method === 'POST') {
            return await handleSeedDemoData(res);
        }

        // 404 for unknown routes
        return res.status(404).json({ error: 'Not Found', path });

    } catch (error: any) {
        console.error('API Error:', error);
        return res.status(500).json({ error: error.message || 'Internal Server Error' });
    }
}

// ===================== AUTH HANDLERS =====================
async function handleLogin(req: VercelRequest, res: VercelResponse) {
    const { username, password } = req.body || {};

    if (!username || !password) {
        return res.status(400).json({ error: 'Username and password required' });
    }

    const db = getDb();
    const users = await db.execute(
        'SELECT id, username, password_hash, role, email FROM users WHERE username = ?',
        [username]
    ) as any[];

    if (!users || users.length === 0) {
        return res.status(401).json({ error: 'Invalid credentials' });
    }

    const user = users[0];
    if (!user.password_hash) {
        return res.status(401).json({ error: 'Invalid credentials' });
    }

    const isValid = await bcrypt.compare(password, user.password_hash);
    if (!isValid) {
        return res.status(401).json({ error: 'Invalid credentials' });
    }

    return res.json({
        user: {
            id: user.id,
            username: user.username,
            email: user.email || '',
            role: user.role || 'Staff'
        },
        token: user.username
    });
}

async function handleGetMe(req: VercelRequest, res: VercelResponse) {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Not authenticated' });
    }

    const username = authHeader.substring(7);
    const db = getDb();
    const users = await db.execute(
        'SELECT id, username, role, email FROM users WHERE username = ?',
        [username]
    ) as any[];

    if (!users || users.length === 0) {
        return res.status(401).json({ error: 'User not found' });
    }

    return res.json({ user: users[0] });
}

// ===================== JOBS HANDLERS =====================
async function handleGetJobs(res: VercelResponse) {
    const db = getDb();
    const jobs = await db.execute('SELECT * FROM jobs ORDER BY created_at DESC LIMIT 100') as any[];
    return res.json(jobs || []);
}

async function handleGetJob(res: VercelResponse, id: string) {
    const db = getDb();
    const jobs = await db.execute('SELECT * FROM jobs WHERE id = ?', [id]) as any[];
    if (!jobs || jobs.length === 0) {
        return res.status(404).json({ error: 'Job not found' });
    }
    return res.json(jobs[0]);
}

async function handleCreateJob(req: VercelRequest, res: VercelResponse) {
    const db = getDb();
    const data = req.body || {};
    const id = `job-${Date.now()}`;
    const jobNo = `JC-${Date.now().toString().slice(-6)}`;

    await db.execute(
        `INSERT INTO jobs (id, job_no, customer_id, vehicle_id, status, priority, services, total_amount, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
        [id, jobNo, data.customer_id || null, data.vehicle_id || null, data.status || 'pending',
            data.priority || 'normal', JSON.stringify(data.services || []), data.total_amount || 0]
    );

    return res.status(201).json({ id, job_no: jobNo, ...data });
}

async function handleUpdateJob(req: VercelRequest, res: VercelResponse, id: string) {
    const db = getDb();
    const data = req.body || {};

    await db.execute(
        `UPDATE jobs SET status = ?, priority = ?, services = ?, total_amount = ?, updated_at = NOW() WHERE id = ?`,
        [data.status || 'pending', data.priority || 'normal', JSON.stringify(data.services || []), data.total_amount || 0, id]
    );

    return res.json({ id, ...data });
}

async function handleDeleteJob(res: VercelResponse, id: string) {
    const db = getDb();
    await db.execute('DELETE FROM jobs WHERE id = ?', [id]);
    return res.json({ success: true });
}

// ===================== CUSTOMERS HANDLERS =====================
async function handleGetCustomers(res: VercelResponse) {
    const db = getDb();
    const customers = await db.execute('SELECT * FROM customers ORDER BY created_at DESC LIMIT 100') as any[];
    return res.json(customers || []);
}

async function handleCreateCustomer(req: VercelRequest, res: VercelResponse) {
    const db = getDb();
    const data = req.body || {};
    const id = `cust-${Date.now()}`;

    await db.execute(
        `INSERT INTO customers (id, name, phone, email, address, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, NOW(), NOW())`,
        [id, data.name || '', data.phone || '', data.email || '', data.address || '']
    );

    return res.status(201).json({ id, ...data });
}

async function handleUpdateCustomer(req: VercelRequest, res: VercelResponse, id: string) {
    const db = getDb();
    const data = req.body || {};

    await db.execute(
        `UPDATE customers SET name = ?, phone = ?, email = ?, address = ?, updated_at = NOW() WHERE id = ?`,
        [data.name || '', data.phone || '', data.email || '', data.address || '', id]
    );

    return res.json({ id, ...data });
}

async function handleDeleteCustomer(res: VercelResponse, id: string) {
    const db = getDb();
    await db.execute('DELETE FROM customers WHERE id = ?', [id]);
    return res.json({ success: true });
}

// ===================== SERVICES HANDLERS =====================
async function handleGetServices(res: VercelResponse) {
    const db = getDb();
    const services = await db.execute('SELECT * FROM services ORDER BY name ASC') as any[];
    return res.json(services || []);
}

async function handleCreateService(req: VercelRequest, res: VercelResponse) {
    const db = getDb();
    const data = req.body || {};
    const id = `svc-${Date.now()}`;

    await db.execute(
        `INSERT INTO services (id, name, description, price, duration, category, created_at)
         VALUES (?, ?, ?, ?, ?, ?, NOW())`,
        [id, data.name || '', data.description || '', data.price || 0, data.duration || 60, data.category || 'General']
    );

    return res.status(201).json({ id, ...data });
}

async function handleUpdateService(req: VercelRequest, res: VercelResponse, id: string) {
    const db = getDb();
    const data = req.body || {};

    await db.execute(
        `UPDATE services SET name = ?, description = ?, price = ?, duration = ?, category = ? WHERE id = ?`,
        [data.name || '', data.description || '', data.price || 0, data.duration || 60, data.category || 'General', id]
    );

    return res.json({ id, ...data });
}

async function handleDeleteService(res: VercelResponse, id: string) {
    const db = getDb();
    await db.execute('DELETE FROM services WHERE id = ?', [id]);
    return res.json({ success: true });
}

// ===================== BIKES HANDLERS =====================
async function handleGetBikes(res: VercelResponse) {
    const db = getDb();
    const bikes = await db.execute('SELECT * FROM bikes ORDER BY created_at DESC LIMIT 100') as any[];
    return res.json(bikes || []);
}

async function handleCreateBike(req: VercelRequest, res: VercelResponse) {
    const db = getDb();
    const data = req.body || {};
    const id = `bike-${Date.now()}`;

    await db.execute(
        `INSERT INTO bikes (id, customer_id, make, model, year, registration_no, color, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, NOW())`,
        [id, data.customer_id || null, data.make || '', data.model || '', data.year || null, data.registration_no || '', data.color || '']
    );

    return res.status(201).json({ id, ...data });
}

async function handleUpdateBike(req: VercelRequest, res: VercelResponse, id: string) {
    const db = getDb();
    const data = req.body || {};

    await db.execute(
        `UPDATE bikes SET make = ?, model = ?, year = ?, registration_no = ?, color = ? WHERE id = ?`,
        [data.make || '', data.model || '', data.year || null, data.registration_no || '', data.color || '', id]
    );

    return res.json({ id, ...data });
}

async function handleDeleteBike(res: VercelResponse, id: string) {
    const db = getDb();
    await db.execute('DELETE FROM bikes WHERE id = ?', [id]);
    return res.json({ success: true });
}

// ===================== PAYMENTS HANDLERS =====================
async function handleGetPayments(res: VercelResponse) {
    const db = getDb();
    const payments = await db.execute('SELECT * FROM payments ORDER BY created_at DESC LIMIT 100') as any[];
    return res.json(payments || []);
}

async function handleCreatePayment(req: VercelRequest, res: VercelResponse) {
    const db = getDb();
    const data = req.body || {};
    const id = `pay-${Date.now()}`;

    await db.execute(
        `INSERT INTO payments (id, job_id, customer_id, amount, method, status, created_at)
         VALUES (?, ?, ?, ?, ?, ?, NOW())`,
        [id, data.job_id || null, data.customer_id || null, data.amount || 0, data.method || 'cash', data.status || 'completed']
    );

    return res.status(201).json({ id, ...data });
}

async function handleGetPaymentSummary(res: VercelResponse) {
    const db = getDb();
    const summary = await db.execute(`
        SELECT 
            COUNT(*) as total_count,
            COALESCE(SUM(amount), 0) as total_amount,
            COALESCE(SUM(CASE WHEN status = 'completed' THEN amount ELSE 0 END), 0) as collected,
            COALESCE(SUM(CASE WHEN status = 'pending' THEN amount ELSE 0 END), 0) as pending
        FROM payments
    `) as any[];

    return res.json(summary?.[0] || { total_count: 0, total_amount: 0, collected: 0, pending: 0 });
}

// ===================== QUOTES HANDLERS =====================
async function handleGetQuotes(res: VercelResponse) {
    const db = getDb();
    const quotes = await db.execute(`
        SELECT q.*, c.name as customer_name, c.phone as customer_phone 
        FROM quotes q 
        LEFT JOIN customers c ON q.customer_id = c.id 
        ORDER BY q.created_at DESC LIMIT 100
    `) as any[];
    return res.json(quotes || []);
}

async function handleCreateQuote(req: VercelRequest, res: VercelResponse) {
    const db = getDb();
    const data = req.body || {};
    const id = `qt-${Date.now()}`;
    const quoteNo = `QT-${Date.now().toString().slice(-6)}`;

    await db.execute(
        `INSERT INTO quotes (id, quote_no, customer_id, valid_until, status, items, notes, total, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
        [id, quoteNo, data.customer_id || null, data.valid_until || null, data.status || 'draft',
            JSON.stringify(data.items || []), data.notes || '', calculateTotal(data.items)]
    );

    return res.status(201).json({ id, quote_no: quoteNo, ...data });
}

async function handleUpdateQuote(req: VercelRequest, res: VercelResponse, id: string) {
    const db = getDb();
    const data = req.body || {};

    await db.execute(
        `UPDATE quotes SET customer_id = ?, valid_until = ?, status = ?, items = ?, notes = ?, total = ?, updated_at = NOW() WHERE id = ?`,
        [data.customer_id || null, data.valid_until || null, data.status || 'draft',
        JSON.stringify(data.items || []), data.notes || '', calculateTotal(data.items), id]
    );

    return res.json({ id, ...data });
}

async function handleDeleteQuote(res: VercelResponse, id: string) {
    const db = getDb();
    await db.execute('DELETE FROM quotes WHERE id = ?', [id]);
    return res.json({ success: true });
}

async function handleConvertQuote(req: VercelRequest, res: VercelResponse, id: string) {
    const db = getDb();

    // Get the quote
    const quotes = await db.execute('SELECT * FROM quotes WHERE id = ?', [id]) as any[];
    if (!quotes || quotes.length === 0) {
        return res.status(404).json({ error: 'Quote not found' });
    }
    const quote = quotes[0];

    // Create job from quote
    const jobId = `job-${Date.now()}`;
    const jobNo = `JC-${Date.now().toString().slice(-6)}`;

    // Parse items if they're a string (handling potential JSON stringification in DB)
    let items = quote.items;
    if (typeof items === 'string') {
        try { items = JSON.parse(items); } catch (e) { items = []; }
    }

    // Map quote items (description, quantity, unit_price) to job services (name, quantity, amount)
    const services = Array.isArray(items) ? items.map((item: any) => ({
        name: item.description || 'Service',
        quantity: item.quantity || 1,
        amount: item.unit_price || 0
    })) : [];

    await db.execute(
        `INSERT INTO jobs (id, job_no, customer_id, status, priority, services, total_amount, notes, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
        [jobId, jobNo, quote.customer_id, 'pending', 'normal',
            JSON.stringify(services), quote.total, `Converted from Quote ${quote.quote_no}`]
    );

    // Update quote status
    await db.execute('UPDATE quotes SET status = ? WHERE id = ?', ['converted', id]);

    return res.json({ success: true, jobId, jobNo });
}

// Admin: Purge all data from database
async function handlePurgeAllData(res: VercelResponse) {
    const db = getDb();

    try {
        // Truncate tables in correct order (respecting foreign keys)
        await db.execute('SET FOREIGN_KEY_CHECKS=0');

        const tables = [
            'payments', 'quote_items', 'quotes', 'time_entries',
            'job_services', 'job_parts', 'jobs', 'warranty_claims',
            'service_history', 'bikes', 'customers', 'parts', 'services',
            'photo_gallery', 'mechanics', 'inventory', 'leads', 'users'
        ];

        for (const table of tables) {
            try {
                await db.execute(`TRUNCATE TABLE ${table}`);
            } catch (e) {
                console.log(`Table ${table} might not exist, skipping...`);
            }
        }

        await db.execute('SET FOREIGN_KEY_CHECKS=1');

        return res.json({
            success: true,
            message: 'All data purged successfully',
            tables_cleared: tables.length
        });
    } catch (error: any) {
        return res.status(500).json({ error: error.message });
    }
}

// Admin: Seed demo data
async function handleSeedDemoData(res: VercelResponse) {
    const db = getDb();

    try {
        // Insert demo customers
        const customers = [
            { id: 'cust-demo-1', name: 'Rahul Sharma', email: 'rahul@example.com', phone: '+91-9876543210', address: 'Mumbai, Maharashtra' },
            { id: 'cust-demo-2', name: 'Priya Patel', email: 'priya@example.com', phone: '+91-9876543211', address: 'Ahmedabad, Gujarat' },
            { id: 'cust-demo-3', name: 'Amit Singh', email: 'amit@example.com', phone: '+91-9876543212', address: 'Delhi, NCR' }
        ];

        for (const cust of customers) {
            await db.execute(
                'INSERT INTO customers (id, name, email, phone, address) VALUES (?, ?, ?, ?, ?)',
                [cust.id, cust.name, cust.email, cust.phone, cust.address]
            );
        }

        // Insert demo bikes
        const bikes = [
            { id: 'bike-demo-1', registration_no: 'MH01XX1234', customer_id: 'cust-demo-1', manufacturer: 'Royal Enfield', model: 'Classic 350', year: 2022, color: 'Stealth Black' },
            { id: 'bike-demo-2', registration_no: 'GJ05YY5678', customer_id: 'cust-demo-2', manufacturer: 'Honda', model: 'Activa 6G', year: 2023, color: 'Pearl White' },
            { id: 'bike-demo-3', registration_no: 'DL03ZZ9012', customer_id: 'cust-demo-3', manufacturer: 'Bajaj', model: 'Pulsar NS200', year: 2021, color: 'Racing Red' }
        ];

        for (const bike of bikes) {
            await db.execute(
                'INSERT INTO bikes (id, registration_no, customer_id, manufacturer, model, year, color) VALUES (?, ?, ?, ?, ?, ?, ?)',
                [bike.id, bike.registration_no, bike.customer_id, bike.manufacturer, bike.model, bike.year, bike.color]
            );
        }

        // Insert demo services
        const services = [
            { id: 'svc-demo-1', name: 'General Service', description: 'Complete bike servicing', price: 800, duration: 60, category: 'General' },
            { id: 'svc-demo-2', name: 'Oil Change', description: 'Engine oil replacement', price: 500, duration: 30, category: 'General' },
            { id: 'svc-demo-3', name: 'Brake Service', description: 'Brake pad replacement and adjustment', price: 1200, duration: 45, category: 'General' }
        ];

        for (const svc of services) {
            await db.execute(
                'INSERT INTO services (id, name, description, price, duration, category) VALUES (?, ?, ?, ?, ?, ?)',
                [svc.id, svc.name, svc.description, svc.price, svc.duration, svc.category]
            );
        }

        // Insert demo jobs
        const job = {
            id: 'job-demo-1',
            job_no: 'JC-001',
            customer_id: 'cust-demo-1',
            vehicle_id: 'bike-demo-1',
            status: 'in_progress',
            priority: 'normal',
            services: JSON.stringify([{ name: 'General Service', quantity: 1, amount: 800 }]),
            total_amount: 800,
            notes: 'Demo job card for testing'
        };

        await db.execute(
            `INSERT INTO jobs (id, job_no, customer_id, vehicle_id, status, priority, services, total_amount, notes, created_at, updated_at) 
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
            [job.id, job.job_no, job.customer_id, job.vehicle_id, job.status, job.priority, job.services, job.total_amount, job.notes]
        );

        return res.json({
            success: true,
            message: 'Demo data seeded successfully',
            data: {
                customers: customers.length,
                bikes: bikes.length,
                services: services.length,
                jobs: 1
            }
        });
    } catch (error: any) {
        return res.status(500).json({ error: error.message });
    }
}

function calculateTotal(items: any[]) {
    if (!Array.isArray(items)) return 0;
    return items.reduce((sum, item) => sum + ((Number(item.quantity) || 0) * (Number(item.unit_price) || 0)), 0);
}
