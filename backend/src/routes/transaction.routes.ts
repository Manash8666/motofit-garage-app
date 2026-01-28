/**
 * MotoFit 2 - Transaction Routes
 * Accounting Ledger API
 */
import express, { Request, Response } from 'express';
import { getPool } from '../db/tidb';
import { v4 as uuidv4 } from 'uuid';

const router = express.Router();
const pool = getPool();

// Generate transaction number
const generateTransactionNo = async (): Promise<string> => {
    const year = new Date().getFullYear();
    const [rows] = await pool.query(
        `SELECT COUNT(*) as count FROM transactions WHERE YEAR(created_at) = ?`,
        [year]
    );
    const count = (rows as any[])[0].count + 1;
    return `TXN-${year}-${String(count).padStart(5, '0')}`;
};

// GET all transactions
router.get('/', async (req: Request, res: Response) => {
    try {
        const { type, start_date, end_date } = req.query;
        let query = `
            SELECT t.*, tc.name as category_name
            FROM transactions t
            LEFT JOIN transaction_categories tc ON t.category_id = tc.id
        `;
        const params: any[] = [];
        const conditions: string[] = [];

        if (type) {
            conditions.push(`t.type = ?`);
            params.push(type);
        }
        if (start_date) {
            conditions.push(`t.transaction_date >= ?`);
            params.push(start_date);
        }
        if (end_date) {
            conditions.push(`t.transaction_date <= ?`);
            params.push(end_date);
        }

        if (conditions.length > 0) {
            query += ` WHERE ` + conditions.join(' AND ');
        }
        query += ` ORDER BY t.transaction_date DESC, t.created_at DESC`;

        const [rows] = await pool.query(query, params);
        res.json(rows);
    } catch (error) {
        console.error('Error fetching transactions:', error);
        res.status(500).json({ error: 'Failed to fetch transactions' });
    }
});

// GET categories
router.get('/categories', async (req: Request, res: Response) => {
    try {
        const [rows] = await pool.query(`SELECT * FROM transaction_categories WHERE is_active = TRUE ORDER BY type, name`);
        res.json(rows);
    } catch (error) {
        console.error('Error fetching categories:', error);
        res.status(500).json({ error: 'Failed to fetch categories' });
    }
});

// GET balance summary
router.get('/summary', async (req: Request, res: Response) => {
    try {
        const { month, year } = req.query;
        const targetMonth = month || new Date().getMonth() + 1;
        const targetYear = year || new Date().getFullYear();

        const [income] = await pool.query(`
            SELECT COALESCE(SUM(amount), 0) as total
            FROM transactions
            WHERE type = 'income' AND MONTH(transaction_date) = ? AND YEAR(transaction_date) = ?
        `, [targetMonth, targetYear]);

        const [expense] = await pool.query(`
            SELECT COALESCE(SUM(amount), 0) as total
            FROM transactions
            WHERE type = 'expense' AND MONTH(transaction_date) = ? AND YEAR(transaction_date) = ?
        `, [targetMonth, targetYear]);

        const [byCategory] = await pool.query(`
            SELECT tc.name, t.type, SUM(t.amount) as total
            FROM transactions t
            LEFT JOIN transaction_categories tc ON t.category_id = tc.id
            WHERE MONTH(t.transaction_date) = ? AND YEAR(t.transaction_date) = ?
            GROUP BY tc.id, tc.name, t.type
            ORDER BY t.type, total DESC
        `, [targetMonth, targetYear]);

        const totalIncome = (income as any[])[0].total;
        const totalExpense = (expense as any[])[0].total;

        res.json({
            month: targetMonth,
            year: targetYear,
            income: totalIncome,
            expense: totalExpense,
            profit: totalIncome - totalExpense,
            byCategory
        });
    } catch (error) {
        console.error('Error fetching summary:', error);
        res.status(500).json({ error: 'Failed to fetch summary' });
    }
});

// GET daily breakdown
router.get('/daily', async (req: Request, res: Response) => {
    try {
        const { days = 30 } = req.query;
        const [rows] = await pool.query(`
            SELECT 
                DATE(transaction_date) as date,
                type,
                SUM(amount) as total
            FROM transactions
            WHERE transaction_date >= DATE_SUB(CURDATE(), INTERVAL ? DAY)
            GROUP BY DATE(transaction_date), type
            ORDER BY date DESC
        `, [days]);
        res.json(rows);
    } catch (error) {
        console.error('Error fetching daily breakdown:', error);
        res.status(500).json({ error: 'Failed to fetch daily breakdown' });
    }
});

// POST create transaction
router.post('/', async (req: Request, res: Response) => {
    try {
        const { type, category_id, amount, description, reference_id, reference_type, transaction_date } = req.body;
        const id = uuidv4();
        const transaction_no = await generateTransactionNo();

        await pool.query(
            `INSERT INTO transactions (id, transaction_no, type, category_id, amount, description, reference_id, reference_type, transaction_date)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [id, transaction_no, type, category_id, amount, description, reference_id, reference_type, transaction_date]
        );

        res.status(201).json({ id, transaction_no, message: 'Transaction recorded successfully' });
    } catch (error) {
        console.error('Error creating transaction:', error);
        res.status(500).json({ error: 'Failed to create transaction' });
    }
});

// PUT update transaction
router.put('/:id', async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { type, category_id, amount, description, transaction_date } = req.body;

        await pool.query(
            `UPDATE transactions SET type = ?, category_id = ?, amount = ?, description = ?, transaction_date = ?
             WHERE id = ?`,
            [type, category_id, amount, description, transaction_date, id]
        );

        res.json({ message: 'Transaction updated successfully' });
    } catch (error) {
        console.error('Error updating transaction:', error);
        res.status(500).json({ error: 'Failed to update transaction' });
    }
});

// DELETE transaction
router.delete('/:id', async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        await pool.query(`DELETE FROM transactions WHERE id = ?`, [id]);
        res.json({ message: 'Transaction deleted successfully' });
    } catch (error) {
        console.error('Error deleting transaction:', error);
        res.status(500).json({ error: 'Failed to delete transaction' });
    }
});

export default router;
