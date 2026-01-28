import { Router, Response } from 'express';
import { z } from 'zod';
import { query, queryOne } from '../db/tidb';
import { authenticateUser, requireRole, AuthRequest } from '../middleware/auth.middleware';

const router = Router();
router.use(authenticateUser);

// Customer schema
const customerSchema = z.object({
    name: z.string().min(1),
    phone: z.string().min(10),
    email: z.string().email().optional(),
    address: z.string().optional(),
});

// Helper: Generate unique ID
function generateId(): string {
    return `cust_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

// GET /api/customers - List all customers
router.get('/', async (req: AuthRequest, res: Response) => {
    try {
        const { search } = req.query;

        let sql = 'SELECT * FROM customers';
        const params: any[] = [];

        if (search && typeof search === 'string') {
            sql += ' WHERE name LIKE ? OR phone LIKE ? OR email LIKE ?';
            const searchParam = `%${search}%`;
            params.push(searchParam, searchParam, searchParam);
        }

        sql += ' ORDER BY created_at DESC';

        const customers = await query(sql, params);
        res.json(customers);
    } catch (error) {
        console.error('Get customers error:', error);
        res.status(500).json({ error: 'Failed to fetch customers' });
    }
});

// POST /api/customers - Create new customer
router.post('/', async (req: AuthRequest, res: Response) => {
    try {
        const customerData = customerSchema.parse(req.body);
        const customerId = generateId();

        await query(
            `INSERT INTO customers (id, name, phone, email, address) 
             VALUES (?, ?, ?, ?, ?)`,
            [
                customerId,
                customerData.name,
                customerData.phone,
                customerData.email || null,
                customerData.address || null
            ]
        );

        const newCustomer = await queryOne('SELECT * FROM customers WHERE id = ?', [customerId]);
        res.status(201).json(newCustomer);
    } catch (error) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({ error: 'Invalid request data', details: error.errors });
        }
        console.error('Create customer error:', error);
        res.status(500).json({ error: 'Failed to create customer' });
    }
});

// GET /api/customers/:id - Get single customer
router.get('/:id', async (req: AuthRequest, res: Response) => {
    try {
        const { id } = req.params;
        const customer = await queryOne('SELECT * FROM customers WHERE id = ?', [id]);

        if (!customer) {
            return res.status(404).json({ error: 'Customer not found' });
        }

        // Get customer's bikes
        const bikes = await query('SELECT * FROM bikes WHERE customer_id = ?', [id]);

        // Get customer's jobs
        const jobs = await query('SELECT * FROM jobs WHERE customer_id = ? ORDER BY created_at DESC LIMIT 10', [id]);

        res.json({ ...customer, bikes, jobs });
    } catch (error) {
        console.error('Get customer error:', error);
        res.status(500).json({ error: 'Failed to fetch customer' });
    }
});

// PUT /api/customers/:id - Update customer
router.put('/:id', async (req: AuthRequest, res: Response) => {
    try {
        const { id } = req.params;
        const customerData = customerSchema.partial().parse(req.body);

        const existing = await queryOne('SELECT * FROM customers WHERE id = ?', [id]);
        if (!existing) {
            return res.status(404).json({ error: 'Customer not found' });
        }

        const fields = [];
        const values = [];

        if (customerData.name !== undefined) {
            fields.push('name = ?');
            values.push(customerData.name);
        }
        if (customerData.phone !== undefined) {
            fields.push('phone = ?');
            values.push(customerData.phone);
        }
        if (customerData.email !== undefined) {
            fields.push('email = ?');
            values.push(customerData.email);
        }
        if (customerData.address !== undefined) {
            fields.push('address = ?');
            values.push(customerData.address);
        }

        if (fields.length > 0) {
            fields.push('updated_at = NOW()');
            values.push(id);

            await query(
                `UPDATE customers SET ${fields.join(', ')} WHERE id = ?`,
                values
            );
        }

        const updated = await queryOne('SELECT * FROM customers WHERE id = ?', [id]);
        res.json(updated);
    } catch (error) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({ error: 'Invalid request data', details: error.errors });
        }
        console.error('Update customer error:', error);
        res.status(500).json({ error: 'Failed to update customer' });
    }
});

// DELETE /api/customers/:id - Delete customer (Admin/Manager only)
router.delete('/:id', requireRole('Owner', 'Manager'), async (req: AuthRequest, res: Response) => {
    try {
        const { id } = req.params;

        const existing = await queryOne('SELECT * FROM customers WHERE id = ?', [id]);
        if (!existing) {
            return res.status(404).json({ error: 'Customer not found' });
        }

        await query('DELETE FROM customers WHERE id = ?', [id]);
        res.json({ message: 'Customer deleted successfully' });
    } catch (error) {
        console.error('Delete customer error:', error);
        res.status(500).json({ error: 'Failed to delete customer' });
    }
});

export default router;
