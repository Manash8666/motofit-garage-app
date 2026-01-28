/**
 * MotoFit 2 - Payment Routes
 * Payment Management API
 */
import express, { Request, Response } from 'express';
import { getPool } from '../db/tidb';
import { v4 as uuidv4 } from 'uuid';

const router = express.Router();
const pool = getPool();

// Generate payment number
const generatePaymentNo = async (): Promise<string> => {
    const year = new Date().getFullYear();
    const [rows] = await pool.query(
        `SELECT COUNT(*) as count FROM payments WHERE YEAR(created_at) = ?`,
        [year]
    );
    const count = (rows as any[])[0].count + 1;
    return `PAY-${year}-${String(count).padStart(4, '0')}`;
};

// GET all payments
router.get('/', async (req: Request, res: Response) => {
    try {
        const [rows] = await pool.query(`
            SELECT p.*, c.name as customer_name, j.job_no
            FROM payments p
            LEFT JOIN customers c ON p.customer_id = c.id
            LEFT JOIN jobs j ON p.job_id = j.id
            ORDER BY p.payment_date DESC, p.created_at DESC
        `);
        res.json(rows);
    } catch (error) {
        console.error('Error fetching payments:', error);
        res.status(500).json({ error: 'Failed to fetch payments' });
    }
});

// GET payments by customer
router.get('/customer/:customerId', async (req: Request, res: Response) => {
    try {
        const { customerId } = req.params;
        const [rows] = await pool.query(
            `SELECT p.*, j.job_no FROM payments p
             LEFT JOIN jobs j ON p.job_id = j.id
             WHERE p.customer_id = ?
             ORDER BY p.payment_date DESC`,
            [customerId]
        );
        res.json(rows);
    } catch (error) {
        console.error('Error fetching customer payments:', error);
        res.status(500).json({ error: 'Failed to fetch customer payments' });
    }
});

// GET payment summary
router.get('/summary', async (req: Request, res: Response) => {
    try {
        const [totalToday] = await pool.query(`
            SELECT COALESCE(SUM(amount), 0) as total
            FROM payments WHERE DATE(payment_date) = CURDATE()
        `);

        const [totalMonth] = await pool.query(`
            SELECT COALESCE(SUM(amount), 0) as total
            FROM payments WHERE MONTH(payment_date) = MONTH(CURDATE()) AND YEAR(payment_date) = YEAR(CURDATE())
        `);

        const [byMethod] = await pool.query(`
            SELECT payment_method, SUM(amount) as total, COUNT(*) as count
            FROM payments
            WHERE MONTH(payment_date) = MONTH(CURDATE())
            GROUP BY payment_method
        `);

        res.json({
            today: (totalToday as any[])[0].total,
            month: (totalMonth as any[])[0].total,
            byMethod
        });
    } catch (error) {
        console.error('Error fetching payment summary:', error);
        res.status(500).json({ error: 'Failed to fetch payment summary' });
    }
});

// POST create payment
router.post('/', async (req: Request, res: Response) => {
    try {
        const { job_id, customer_id, amount, payment_method, payment_date, reference_no, notes } = req.body;
        const id = uuidv4();
        const payment_no = await generatePaymentNo();

        await pool.query(
            `INSERT INTO payments (id, payment_no, job_id, customer_id, amount, payment_method, payment_date, reference_no, notes)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [id, payment_no, job_id, customer_id, amount, payment_method || 'cash', payment_date, reference_no, notes]
        );

        res.status(201).json({ id, payment_no, message: 'Payment recorded successfully' });
    } catch (error) {
        console.error('Error creating payment:', error);
        res.status(500).json({ error: 'Failed to create payment' });
    }
});

// PUT update payment
router.put('/:id', async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { amount, payment_method, payment_date, reference_no, notes } = req.body;

        await pool.query(
            `UPDATE payments SET amount = ?, payment_method = ?, payment_date = ?, reference_no = ?, notes = ?, updated_at = NOW()
             WHERE id = ?`,
            [amount, payment_method, payment_date, reference_no, notes, id]
        );

        res.json({ message: 'Payment updated successfully' });
    } catch (error) {
        console.error('Error updating payment:', error);
        res.status(500).json({ error: 'Failed to update payment' });
    }
});

// DELETE payment
router.delete('/:id', async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        await pool.query(`DELETE FROM payments WHERE id = ?`, [id]);
        res.json({ message: 'Payment deleted successfully' });
    } catch (error) {
        console.error('Error deleting payment:', error);
        res.status(500).json({ error: 'Failed to delete payment' });
    }
});

export default router;
