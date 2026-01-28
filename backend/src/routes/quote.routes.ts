/**
 * MotoFit 2 - Quote Routes
 * CRM Quote Management API
 */
import express, { Request, Response } from 'express';
import { getPool } from '../db/tidb';
import { v4 as uuidv4 } from 'uuid';

const router = express.Router();
const pool = getPool();

// Generate quote number
const generateQuoteNo = async (): Promise<string> => {
    const year = new Date().getFullYear();
    const [rows] = await pool.query(
        `SELECT COUNT(*) as count FROM quotes WHERE YEAR(created_at) = ?`,
        [year]
    );
    const count = (rows as any[])[0].count + 1;
    return `QT-${year}-${String(count).padStart(3, '0')}`;
};

// GET all quotes
router.get('/', async (req: Request, res: Response) => {
    try {
        const [rows] = await pool.query(`
            SELECT q.*, c.name as customer_name, c.phone as customer_phone
            FROM quotes q
            LEFT JOIN customers c ON q.customer_id = c.id
            ORDER BY q.created_at DESC
        `);
        res.json(rows);
    } catch (error) {
        console.error('Error fetching quotes:', error);
        res.status(500).json({ error: 'Failed to fetch quotes' });
    }
});

// GET single quote with items
router.get('/:id', async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const [quotes] = await pool.query(
            `SELECT q.*, c.name as customer_name, c.phone as customer_phone
             FROM quotes q
             LEFT JOIN customers c ON q.customer_id = c.id
             WHERE q.id = ?`,
            [id]
        );

        if ((quotes as any[]).length === 0) {
            return res.status(404).json({ error: 'Quote not found' });
        }

        const [items] = await pool.query(
            `SELECT qi.*, s.name as service_name
             FROM quote_items qi
             LEFT JOIN services s ON qi.service_id = s.id
             WHERE qi.quote_id = ?`,
            [id]
        );

        res.json({ ...(quotes as any[])[0], items });
    } catch (error) {
        console.error('Error fetching quote:', error);
        res.status(500).json({ error: 'Failed to fetch quote' });
    }
});

// POST create quote
router.post('/', async (req: Request, res: Response) => {
    try {
        const { customer_id, valid_until, notes, items } = req.body;
        const id = uuidv4();
        const quote_no = await generateQuoteNo();

        // Calculate totals
        let subtotal = 0;
        if (items && items.length > 0) {
            subtotal = items.reduce((sum: number, item: any) => sum + (item.quantity * item.unit_price), 0);
        }
        const total = subtotal; // No GST as per user preference

        await pool.query(
            `INSERT INTO quotes (id, quote_no, customer_id, customer_name, customer_phone, valid_until, status, subtotal, discount, total, notes)
             VALUES (?, ?, ?, ?, ?, ?, 'draft', ?, 0, ?, ?)`,
            [id, quote_no, customer_id, req.body.customer_name || null, req.body.customer_phone || null, valid_until, subtotal, total, notes]
        );

        // Insert items
        if (items && items.length > 0) {
            for (const item of items) {
                const itemId = uuidv4();
                const itemTotal = item.quantity * item.unit_price;
                await pool.query(
                    `INSERT INTO quote_items (id, quote_id, service_id, description, quantity, unit_price, total)
                     VALUES (?, ?, ?, ?, ?, ?, ?)`,
                    [itemId, id, item.service_id, item.description, item.quantity, item.unit_price, itemTotal]
                );
            }
        }

        res.status(201).json({ id, quote_no, message: 'Quote created successfully' });
    } catch (error) {
        console.error('Error creating quote:', error);
        res.status(500).json({ error: 'Failed to create quote' });
    }
});

// PUT update quote
router.put('/:id', async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { valid_until, status, notes, items } = req.body;

        // Calculate totals
        let subtotal = 0;
        if (items && items.length > 0) {
            subtotal = items.reduce((sum: number, item: any) => sum + (item.quantity * item.unit_price), 0);
        }
        const total = subtotal;

        await pool.query(
            `UPDATE quotes SET valid_until = ?, status = ?, notes = ?, subtotal = ?, total = ?, updated_at = NOW()
             WHERE id = ?`,
            [valid_until, status, notes, subtotal, total, id]
        );

        // Update items - delete existing and re-insert
        await pool.query(`DELETE FROM quote_items WHERE quote_id = ?`, [id]);

        if (items && items.length > 0) {
            for (const item of items) {
                const itemId = uuidv4();
                const itemTotal = item.quantity * item.unit_price;
                await pool.query(
                    `INSERT INTO quote_items (id, quote_id, service_id, description, quantity, unit_price, total)
                     VALUES (?, ?, ?, ?, ?, ?, ?)`,
                    [itemId, id, item.service_id, item.description, item.quantity, item.unit_price, itemTotal]
                );
            }
        }

        res.json({ message: 'Quote updated successfully' });
    } catch (error) {
        console.error('Error updating quote:', error);
        res.status(500).json({ error: 'Failed to update quote' });
    }
});

// POST convert quote to job
router.post('/:id/convert', async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        // Get quote details
        const [quotes] = await pool.query(`SELECT * FROM quotes WHERE id = ?`, [id]);
        if ((quotes as any[]).length === 0) {
            return res.status(404).json({ error: 'Quote not found' });
        }

        const quote = (quotes as any[])[0];

        // Update quote status
        await pool.query(
            `UPDATE quotes SET status = 'converted', updated_at = NOW() WHERE id = ?`,
            [id]
        );

        res.json({ message: 'Quote converted successfully', quote_id: id });
    } catch (error) {
        console.error('Error converting quote:', error);
        res.status(500).json({ error: 'Failed to convert quote' });
    }
});

// DELETE quote
router.delete('/:id', async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        await pool.query(`DELETE FROM quotes WHERE id = ?`, [id]);
        res.json({ message: 'Quote deleted successfully' });
    } catch (error) {
        console.error('Error deleting quote:', error);
        res.status(500).json({ error: 'Failed to delete quote' });
    }
});

export default router;
