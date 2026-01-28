import { Router, Response } from 'express';
import { z } from 'zod';
import { query, queryOne } from '../db/tidb';
import { authenticateUser, requireRole, AuthRequest } from '../middleware/auth.middleware';

const router = Router();
router.use(authenticateUser);

// Bike schema
const bikeSchema = z.object({
    customer_id: z.string().min(1),
    make: z.string().min(1),
    model: z.string().min(1),
    year: z.number().int().positive().optional(),
    registration: z.string().optional(),
    chassis: z.string().optional(),
    engine: z.string().optional(),
    color: z.string().optional(),
    odometer: z.number().int().nonnegative().optional(),
});

// Helper: Generate unique ID
function generateId(): string {
    return `bike_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

// GET /api/bikes - List all bikes
router.get('/', async (req: AuthRequest, res: Response) => {
    try {
        const { search, customer_id } = req.query;

        let sql = `
            SELECT b.*, c.name as customer_name, c.phone as customer_phone
            FROM bikes b
            LEFT JOIN customers c ON b.customer_id = c.id
            WHERE 1=1
        `;
        const params: any[] = [];

        if (customer_id) {
            sql += ' AND b.customer_id = ?';
            params.push(customer_id);
        }

        if (search && typeof search === 'string') {
            sql += ' AND (b.make LIKE ? OR b.model LIKE ? OR b.registration LIKE ?)';
            const searchParam = `%${search}%`;
            params.push(searchParam, searchParam, searchParam);
        }

        sql += ' ORDER BY b.created_at DESC';

        const bikes = await query(sql, params);
        res.json(bikes);
    } catch (error) {
        console.error('Get bikes error:', error);
        res.status(500).json({ error: 'Failed to fetch bikes' });
    }
});

// POST /api/bikes - Create new bike
router.post('/', async (req: AuthRequest, res: Response) => {
    try {
        const bikeData = bikeSchema.parse(req.body);
        const bikeId = generateId();

        // Verify customer exists
        const customer = await queryOne('SELECT id FROM customers WHERE id = ?', [bikeData.customer_id]);
        if (!customer) {
            return res.status(400).json({ error: 'Customer not found' });
        }

        await query(
            `INSERT INTO bikes (id, customer_id, make, model, year, registration, chassis, engine, color, odometer) 
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                bikeId,
                bikeData.customer_id,
                bikeData.make,
                bikeData.model,
                bikeData.year || null,
                bikeData.registration || null,
                bikeData.chassis || null,
                bikeData.engine || null,
                bikeData.color || null,
                bikeData.odometer || 0
            ]
        );

        const newBike = await queryOne(`
            SELECT b.*, c.name as customer_name 
            FROM bikes b 
            LEFT JOIN customers c ON b.customer_id = c.id 
            WHERE b.id = ?
        `, [bikeId]);

        res.status(201).json(newBike);
    } catch (error) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({ error: 'Invalid request data', details: error.errors });
        }
        console.error('Create bike error:', error);
        res.status(500).json({ error: 'Failed to create bike' });
    }
});

// GET /api/bikes/:id - Get single bike
router.get('/:id', async (req: AuthRequest, res: Response) => {
    try {
        const { id } = req.params;

        const bike = await queryOne(`
            SELECT b.*, c.name as customer_name, c.phone as customer_phone 
            FROM bikes b 
            LEFT JOIN customers c ON b.customer_id = c.id 
            WHERE b.id = ?
        `, [id]);

        if (!bike) {
            return res.status(404).json({ error: 'Bike not found' });
        }

        // Get service history for this bike
        const serviceHistory = await query(
            'SELECT * FROM service_history WHERE bike_id = ? ORDER BY service_date DESC',
            [id]
        );

        // Get recent jobs for this bike
        const jobs = await query(
            'SELECT * FROM jobs WHERE bike_id = ? ORDER BY created_at DESC LIMIT 10',
            [id]
        );

        res.json({ ...bike, serviceHistory, jobs });
    } catch (error) {
        console.error('Get bike error:', error);
        res.status(500).json({ error: 'Failed to fetch bike' });
    }
});

// PUT /api/bikes/:id - Update bike
router.put('/:id', async (req: AuthRequest, res: Response) => {
    try {
        const { id } = req.params;
        const bikeData = bikeSchema.partial().parse(req.body);

        const existing = await queryOne('SELECT * FROM bikes WHERE id = ?', [id]);
        if (!existing) {
            return res.status(404).json({ error: 'Bike not found' });
        }

        const fields = [];
        const values = [];

        if (bikeData.make !== undefined) {
            fields.push('make = ?');
            values.push(bikeData.make);
        }
        if (bikeData.model !== undefined) {
            fields.push('model = ?');
            values.push(bikeData.model);
        }
        if (bikeData.year !== undefined) {
            fields.push('year = ?');
            values.push(bikeData.year);
        }
        if (bikeData.registration !== undefined) {
            fields.push('registration = ?');
            values.push(bikeData.registration);
        }
        if (bikeData.color !== undefined) {
            fields.push('color = ?');
            values.push(bikeData.color);
        }
        if (bikeData.odometer !== undefined) {
            fields.push('odometer = ?');
            values.push(bikeData.odometer);
        }

        if (fields.length > 0) {
            fields.push('updated_at = NOW()');
            values.push(id);

            await query(
                `UPDATE bikes SET ${fields.join(', ')} WHERE id = ?`,
                values
            );
        }

        const updated = await queryOne(`
            SELECT b.*, c.name as customer_name 
            FROM bikes b 
            LEFT JOIN customers c ON b.customer_id = c.id 
            WHERE b.id = ?
        `, [id]);

        res.json(updated);
    } catch (error) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({ error: 'Invalid request data', details: error.errors });
        }
        console.error('Update bike error:', error);
        res.status(500).json({ error: 'Failed to update bike' });
    }
});

// DELETE /api/bikes/:id - Delete bike (Admin/Manager only)
router.delete('/:id', requireRole('Owner', 'Manager'), async (req: AuthRequest, res: Response) => {
    try {
        const { id } = req.params;

        const existing = await queryOne('SELECT * FROM bikes WHERE id = ?', [id]);
        if (!existing) {
            return res.status(404).json({ error: 'Bike not found' });
        }

        await query('DELETE FROM bikes WHERE id = ?', [id]);
        res.json({ message: 'Bike deleted successfully' });
    } catch (error) {
        console.error('Delete bike error:', error);
        res.status(500).json({ error: 'Failed to delete bike' });
    }
});

export default router;
