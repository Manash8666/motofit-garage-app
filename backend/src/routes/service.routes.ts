import { Router, Response } from 'express';
import { z } from 'zod';
import { query, queryOne } from '../db/tidb';
import { authenticateUser, requireRole, AuthRequest } from '../middleware/auth.middleware';

const router = Router();
router.use(authenticateUser);

// Service schema
const serviceSchema = z.object({
    name: z.string().min(1),
    category: z.string().min(1),
    description: z.string().optional(),
    price: z.number().positive(),
    duration_minutes: z.number().positive().optional(),
    is_active: z.boolean().optional(),
});

// Helper: Generate unique ID
function generateId(): string {
    return `srv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

// GET /api/services - List all services
router.get('/', async (req: AuthRequest, res: Response) => {
    try {
        const { category, search, is_active } = req.query;

        let sql = 'SELECT * FROM services WHERE 1=1';
        const params: any[] = [];

        if (category) {
            sql += ' AND category = ?';
            params.push(category);
        }

        if (is_active !== undefined) {
            sql += ' AND is_active = ?';
            params.push(is_active === 'true');
        }

        if (search && typeof search === 'string') {
            sql += ' AND (name LIKE ? OR description LIKE ?)';
            const searchParam = `%${search}%`;
            params.push(searchParam, searchParam);
        }

        sql += ' ORDER BY category, name';

        const services = await query(sql, params);
        res.json(services);
    } catch (error) {
        console.error('Get services error:', error);
        res.status(500).json({ error: 'Failed to fetch services' });
    }
});

// GET /api/services/categories - Get unique categories
router.get('/categories', async (req: AuthRequest, res: Response) => {
    try {
        const categories = await query('SELECT DISTINCT category FROM services ORDER BY category');
        res.json(categories.map((c: any) => c.category));
    } catch (error) {
        console.error('Get categories error:', error);
        res.status(500).json({ error: 'Failed to fetch categories' });
    }
});

// POST /api/services - Create new service
router.post('/', requireRole('Owner', 'Manager'), async (req: AuthRequest, res: Response) => {
    try {
        const serviceData = serviceSchema.parse(req.body);
        const serviceId = generateId();

        await query(
            `INSERT INTO services (id, name, category, description, price, duration_minutes, is_active) 
             VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [
                serviceId,
                serviceData.name,
                serviceData.category,
                serviceData.description || null,
                serviceData.price,
                serviceData.duration_minutes || 60,
                serviceData.is_active !== false
            ]
        );

        const newService = await queryOne('SELECT * FROM services WHERE id = ?', [serviceId]);
        res.status(201).json(newService);
    } catch (error) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({ error: 'Invalid request data', details: error.errors });
        }
        console.error('Create service error:', error);
        res.status(500).json({ error: 'Failed to create service' });
    }
});

// GET /api/services/:id - Get single service
router.get('/:id', async (req: AuthRequest, res: Response) => {
    try {
        const { id } = req.params;
        const service = await queryOne('SELECT * FROM services WHERE id = ?', [id]);

        if (!service) {
            return res.status(404).json({ error: 'Service not found' });
        }

        res.json(service);
    } catch (error) {
        console.error('Get service error:', error);
        res.status(500).json({ error: 'Failed to fetch service' });
    }
});

// PUT /api/services/:id - Update service
router.put('/:id', requireRole('Owner', 'Manager'), async (req: AuthRequest, res: Response) => {
    try {
        const { id } = req.params;
        const serviceData = serviceSchema.partial().parse(req.body);

        const existing = await queryOne('SELECT * FROM services WHERE id = ?', [id]);
        if (!existing) {
            return res.status(404).json({ error: 'Service not found' });
        }

        const fields = [];
        const values = [];

        if (serviceData.name !== undefined) {
            fields.push('name = ?');
            values.push(serviceData.name);
        }
        if (serviceData.category !== undefined) {
            fields.push('category = ?');
            values.push(serviceData.category);
        }
        if (serviceData.description !== undefined) {
            fields.push('description = ?');
            values.push(serviceData.description);
        }
        if (serviceData.price !== undefined) {
            fields.push('price = ?');
            values.push(serviceData.price);
        }
        if (serviceData.duration_minutes !== undefined) {
            fields.push('duration_minutes = ?');
            values.push(serviceData.duration_minutes);
        }
        if (serviceData.is_active !== undefined) {
            fields.push('is_active = ?');
            values.push(serviceData.is_active);
        }

        if (fields.length > 0) {
            fields.push('updated_at = NOW()');
            values.push(id);

            await query(
                `UPDATE services SET ${fields.join(', ')} WHERE id = ?`,
                values
            );
        }

        const updated = await queryOne('SELECT * FROM services WHERE id = ?', [id]);
        res.json(updated);
    } catch (error) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({ error: 'Invalid request data', details: error.errors });
        }
        console.error('Update service error:', error);
        res.status(500).json({ error: 'Failed to update service' });
    }
});

// DELETE /api/services/:id - Delete service (Admin only)
router.delete('/:id', requireRole('Owner'), async (req: AuthRequest, res: Response) => {
    try {
        const { id } = req.params;

        const existing = await queryOne('SELECT * FROM services WHERE id = ?', [id]);
        if (!existing) {
            return res.status(404).json({ error: 'Service not found' });
        }

        await query('DELETE FROM services WHERE id = ?', [id]);
        res.json({ message: 'Service deleted successfully' });
    } catch (error) {
        console.error('Delete service error:', error);
        res.status(500).json({ error: 'Failed to delete service' });
    }
});

export default router;
