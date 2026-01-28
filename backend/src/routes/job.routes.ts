import { Router, Response } from 'express';
import { z } from 'zod';
import { query, queryOne } from '../db/tidb';
import { authenticateUser, requireRole, AuthRequest } from '../middleware/auth.middleware';

const router = Router();

// All routes require authentication
router.use(authenticateUser);

// Job schema
const jobSchema = z.object({
    jobNo: z.string(),
    date: z.string(),
    token: z.string().optional(),
    promisedDate: z.string().optional(),
    customer: z.string().min(1),
    phone: z.string().min(1),
    bikeModel: z.string().min(1),
    registration: z.string().optional(),
    chassis: z.string().optional(),
    engine: z.string().optional(),
    mechanic: z.string().min(1),
    services: z.array(z.object({
        name: z.string(),
        price: z.number()
    })),
    parts: z.array(z.object({
        name: z.string(),
        price: z.number()
    })),
    estimatedCost: z.number(),
    notes: z.string().optional(),
    status: z.enum(['Pending', 'Repairing', 'Completed']).default('Pending'),
    warranty: z.boolean().optional(),
});

// Helper: Generate unique ID
function generateId(): string {
    return `job_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

// GET /api/jobs - List all jobs
router.get('/', async (req: AuthRequest, res: Response) => {
    try {
        const { status, search } = req.query;

        let sql = 'SELECT * FROM jobs WHERE 1=1';
        const params: any[] = [];

        if (status) {
            sql += ' AND status = ?';
            params.push(status);
        }

        if (search && typeof search === 'string') {
            sql += ' AND (job_no LIKE ? OR bike_model LIKE ? OR registration LIKE ?)';
            const searchParam = `%${search}%`;
            params.push(searchParam, searchParam, searchParam);
        }

        sql += ' ORDER BY created_at DESC';

        const jobs = await query(sql, params);
        res.json(jobs);
    } catch (error) {
        console.error('Get jobs error:', error);
        res.status(500).json({ error: 'Failed to fetch jobs' });
    }
});

// POST /api/jobs - Create new job
router.post('/', async (req: AuthRequest, res: Response) => {
    try {
        const jobData = jobSchema.parse(req.body);
        const jobId = generateId();

        // Start by inserting customer if not exists
        const customerId = `cust_${Date.now()}`;

        await query(
            `INSERT INTO customers (id, name, phone, email)
             VALUES (?, ?, ?, ?)
             ON DUPLICATE KEY UPDATE phone=VALUES(phone)`,
            [customerId, jobData.customer, jobData.phone, '']
        );

        // Insert job
        await query(
            `INSERT INTO jobs (
                id, job_no, date, token, promised_date, customer_id, phone,
                bike_model, registration, chassis, engine, mechanic,
                estimated_cost, notes, status, warranty
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                jobId,
                jobData.jobNo,
                jobData.date,
                jobData.token || null,
                jobData.promisedDate || null,
                customerId,
                jobData.phone,
                jobData.bikeModel,
                jobData.registration || null,
                jobData.chassis || null,
                jobData.engine || null,
                jobData.mechanic,
                jobData.estimatedCost,
                jobData.notes || null,
                jobData.status,
                jobData.warranty || false
            ]
        );

        // Insert services
        for (const service of jobData.services) {
            const serviceId = `svc_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
            await query(
                `INSERT INTO job_services (id, job_id, service_id, quantity, price)
                 VALUES (?, ?, ?, ?, ?)`,
                [serviceId, jobId, serviceId, 1, service.price]
            );
        }

        // Insert parts
        for (const part of jobData.parts) {
            const partId = `part_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
            await query(
                `INSERT INTO job_parts (id, job_id, part_id, quantity, price)
                 VALUES (?, ?, ?, ?, ?)`,
                [partId, jobId, partId, 1, part.price]
            );
        }

        const newJob = await queryOne('SELECT * FROM jobs WHERE id = ?', [jobId]);
        res.status(201).json(newJob);
    } catch (error) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({ error: 'Invalid request data', details: error.errors });
        }
        console.error('Create job error:', error);
        res.status(500).json({ error: 'Failed to create job' });
    }
});

// GET /api/jobs/:id - Get single job
router.get('/:id', async (req: AuthRequest, res: Response) => {
    try {
        const { id } = req.params;
        const job = await queryOne('SELECT * FROM jobs WHERE id = ?', [id]);

        if (!job) {
            return res.status(404).json({ error: 'Job not found' });
        }

        // Get job services
        const services = await query(
            'SELECT * FROM job_services WHERE job_id = ?',
            [id]
        );

        // Get job parts
        const parts = await query(
            'SELECT * FROM job_parts WHERE job_id = ?',
            [id]
        );

        res.json({ ...job, services, parts });
    } catch (error) {
        console.error('Get job error:', error);
        res.status(500).json({ error: 'Failed to fetch job' });
    }
});

// PUT /api/jobs/:id - Update job
router.put('/:id', async (req: AuthRequest, res: Response) => {
    try {
        const { id } = req.params;
        const jobData = jobSchema.partial().parse(req.body);

        const existing = await queryOne('SELECT * FROM jobs WHERE id = ?', [id]);
        if (!existing) {
            return res.status(404).json({ error: 'Job not found' });
        }

        // Build update query dynamically
        const fields = [];
        const values = [];

        if (jobData.jobNo !== undefined) {
            fields.push('job_no = ?');
            values.push(jobData.jobNo);
        }
        if (jobData.date !== undefined) {
            fields.push('date = ?');
            values.push(jobData.date);
        }
        if (jobData.mechanic !== undefined) {
            fields.push('mechanic = ?');
            values.push(jobData.mechanic);
        }
        if (jobData.status !== undefined) {
            fields.push('status = ?');
            values.push(jobData.status);
        }
        if (jobData.warranty !== undefined) {
            fields.push('warranty = ?');
            values.push(jobData.warranty);
        }
        if (jobData.notes !== undefined) {
            fields.push('notes = ?');
            values.push(jobData.notes);
        }

        if (fields.length > 0) {
            fields.push('updated_at = NOW()');
            values.push(id);

            await query(
                `UPDATE jobs SET ${fields.join(', ')} WHERE id = ?`,
                values
            );
        }

        const updated = await queryOne('SELECT * FROM jobs WHERE id = ?', [id]);
        res.json(updated);
    } catch (error) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({ error: 'Invalid request data', details: error.errors });
        }
        console.error('Update job error:', error);
        res.status(500).json({ error: 'Failed to update job' });
    }
});

// PATCH /api/jobs/:id/status - Update job status
router.patch('/:id/status', async (req: AuthRequest, res: Response) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        if (!['Pending', 'Repairing', 'Completed'].includes(status)) {
            return res.status(400).json({ error: 'Invalid status' });
        }

        const existing = await queryOne('SELECT * FROM jobs WHERE id = ?', [id]);
        if (!existing) {
            return res.status(404).json({ error: 'Job not found' });
        }

        await query(
            'UPDATE jobs SET status = ?, updated_at = NOW() WHERE id = ?',
            [status, id]
        );

        const updated = await queryOne('SELECT * FROM jobs WHERE id = ?', [id]);
        res.json(updated);
    } catch (error) {
        console.error('Update status error:', error);
        res.status(500).json({ error: 'Failed to update status' });
    }
});

// DELETE /api/jobs/:id - Delete job (Admin/Manager only)
router.delete('/:id', requireRole('Owner', 'Manager'), async (req: AuthRequest, res: Response) => {
    try {
        const { id } = req.params;

        const existing = await queryOne('SELECT * FROM jobs WHERE id = ?', [id]);
        if (!existing) {
            return res.status(404).json({ error: 'Job not found' });
        }

        await query('DELETE FROM jobs WHERE id = ?', [id]);
        res.json({ message: 'Job deleted successfully' });
    } catch (error) {
        console.error('Delete job error:', error);
        res.status(500).json({ error: 'Failed to delete job' });
    }
});

export default router;
