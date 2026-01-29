import express, { Application, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import rateLimit from 'express-rate-limit';

import authRoutes from './routes/auth.routes';
import jobRoutes from './routes/job.routes';
import invoiceRoutes from './routes/invoice.routes';
import inventoryRoutes from './routes/inventory.routes';
import customerRoutes from './routes/customer.routes';
import serviceRoutes from './routes/service.routes';
import bikeRoutes from './routes/bike.routes';
import mechanicRoutes from './routes/mechanic.routes';
import reportRoutes from './routes/report.routes';
import timeclockRoutes from './routes/timeclock.routes';
import quoteRoutes from './routes/quote.routes';
import paymentRoutes from './routes/payment.routes';
import leadRoutes from './routes/lead.routes';
import transactionRoutes from './routes/transaction.routes';
import cronRoutes from './routes/cron.routes';

// Load environment variables
dotenv.config();

const app: Application = express();

// Rate limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    message: 'Too many requests from this IP, please try again later.'
});

// Middleware
app.use(helmet()); // Security headers
app.use(cors({
    origin: process.env.CORS_ORIGIN || '*',
    credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/api/', limiter);

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/jobs', jobRoutes);
app.use('/api/invoices', invoiceRoutes);
app.use('/api/inventory', inventoryRoutes);
app.use('/api/customers', customerRoutes);
app.use('/api/services', serviceRoutes);
app.use('/api/bikes', bikeRoutes);
app.use('/api/mechanics', mechanicRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/timeclock', timeclockRoutes);
app.use('/api/quotes', quoteRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/leads', leadRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/cron', cronRoutes);

// Health check
app.get('/api/health', (req: Request, res: Response) => {
    res.json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || 'development'
    });
});

// Root API route
app.get('/api', (req: Request, res: Response) => {
    res.json({
        name: 'MotoFit API',
        version: '1.0.0',
        status: 'running'
    });
});

// 404 handler
app.use((req: Request, res: Response) => {
    res.status(404).json({ error: 'Not Found' });
});

// Error handler
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Something went wrong!', message: err.message });
});

export default app;
