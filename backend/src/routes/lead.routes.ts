/**
 * MotoFit 2 - Lead Routes
 * CRM Lead Management API
 */
import express, { Request, Response } from 'express';
import { getPool } from '../db/tidb';
import { v4 as uuidv4 } from 'uuid';

const router = express.Router();
const pool = getPool();

// GET all leads
router.get('/', async (req: Request, res: Response) => {
    try {
        const { status, source } = req.query;
        let query = `SELECT * FROM leads`;
        const params: any[] = [];
        const conditions: string[] = [];

        if (status) {
            conditions.push(`status = ?`);
            params.push(status);
        }
        if (source) {
            conditions.push(`source = ?`);
            params.push(source);
        }

        if (conditions.length > 0) {
            query += ` WHERE ` + conditions.join(' AND ');
        }
        query += ` ORDER BY created_at DESC`;

        const [rows] = await pool.query(query, params);
        res.json(rows);
    } catch (error) {
        console.error('Error fetching leads:', error);
        res.status(500).json({ error: 'Failed to fetch leads' });
    }
});

// GET lead pipeline stats
router.get('/pipeline', async (req: Request, res: Response) => {
    try {
        const [rows] = await pool.query(`
            SELECT status, COUNT(*) as count
            FROM leads
            GROUP BY status
        `);
        res.json(rows);
    } catch (error) {
        console.error('Error fetching pipeline:', error);
        res.status(500).json({ error: 'Failed to fetch pipeline' });
    }
});

// GET single lead
router.get('/:id', async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const [rows] = await pool.query(`SELECT * FROM leads WHERE id = ?`, [id]);

        if ((rows as any[]).length === 0) {
            return res.status(404).json({ error: 'Lead not found' });
        }

        res.json((rows as any[])[0]);
    } catch (error) {
        console.error('Error fetching lead:', error);
        res.status(500).json({ error: 'Failed to fetch lead' });
    }
});

// POST create lead
router.post('/', async (req: Request, res: Response) => {
    try {
        const { name, phone, email, vehicle_interest, source, assigned_to, notes, follow_up_date } = req.body;
        const id = uuidv4();

        await pool.query(
            `INSERT INTO leads (id, name, phone, email, vehicle_interest, source, status, assigned_to, notes, follow_up_date)
             VALUES (?, ?, ?, ?, ?, ?, 'new', ?, ?, ?)`,
            [id, name, phone, email, vehicle_interest, source || 'walk_in', assigned_to, notes, follow_up_date]
        );

        res.status(201).json({ id, message: 'Lead created successfully' });
    } catch (error) {
        console.error('Error creating lead:', error);
        res.status(500).json({ error: 'Failed to create lead' });
    }
});

// PUT update lead
router.put('/:id', async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { name, phone, email, vehicle_interest, source, status, assigned_to, notes, follow_up_date } = req.body;

        await pool.query(
            `UPDATE leads SET name = ?, phone = ?, email = ?, vehicle_interest = ?, source = ?, status = ?,
             assigned_to = ?, notes = ?, follow_up_date = ?, updated_at = NOW()
             WHERE id = ?`,
            [name, phone, email, vehicle_interest, source, status, assigned_to, notes, follow_up_date, id]
        );

        res.json({ message: 'Lead updated successfully' });
    } catch (error) {
        console.error('Error updating lead:', error);
        res.status(500).json({ error: 'Failed to update lead' });
    }
});

// POST convert lead to customer
router.post('/:id/convert', async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        // Get lead details
        const [leads] = await pool.query(`SELECT * FROM leads WHERE id = ?`, [id]);
        if ((leads as any[]).length === 0) {
            return res.status(404).json({ error: 'Lead not found' });
        }

        const lead = (leads as any[])[0];
        const customerId = uuidv4();

        // Create customer from lead
        await pool.query(
            `INSERT INTO customers (id, name, phone, email)
             VALUES (?, ?, ?, ?)`,
            [customerId, lead.name, lead.phone, lead.email]
        );

        // Update lead status
        await pool.query(
            `UPDATE leads SET status = 'converted', converted_customer_id = ?, updated_at = NOW()
             WHERE id = ?`,
            [customerId, id]
        );

        res.json({
            message: 'Lead converted to customer successfully',
            customer_id: customerId
        });
    } catch (error) {
        console.error('Error converting lead:', error);
        res.status(500).json({ error: 'Failed to convert lead' });
    }
});

// DELETE lead
router.delete('/:id', async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        await pool.query(`DELETE FROM leads WHERE id = ?`, [id]);
        res.json({ message: 'Lead deleted successfully' });
    } catch (error) {
        console.error('Error deleting lead:', error);
        res.status(500).json({ error: 'Failed to delete lead' });
    }
});

export default router;
