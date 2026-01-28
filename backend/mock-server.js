import express from 'express';
import cors from 'cors';

const app = express();
const PORT = 5000;

// Middleware
app.use(cors({ origin: 'http://localhost:5173' }));
app.use(express.json());

// Mock data
const mockUser = {
    id: '1',
    username: 'admin',
    email: 'admin@motofit.com',
    role: 'Owner',
    createdAt: new Date().toISOString()
};

const mockJobs = [
    {
        id: '1',
        jobNo: 'JC-001',
        date: '2026-01-10',
        customer: 'Rahul Kumar',
        phone: '9876543210',
        bikeModel: 'Royal Enfield Classic 350',
        status: 'Completed',
        mechanic: 'Arjun',
        services: ['Engine Overhaul', 'Oil Change'],
        parts: ['Engine Oil', 'Air Filter'],
        estimatedCost: 20000,
        notes: 'Engine completely overhauled',
        createdAt: new Date().toISOString()
    },
    {
        id: '2',
        jobNo: 'JC-002',
        date: '2026-01-12',
        customer: 'Priya Sharma',
        phone: '9123456780',
        bikeModel: 'Honda Activa 6G',
        status: 'Repairing',
        mechanic: 'Vikram',
        services: ['General Service', 'Brake Pads Replacement'],
        parts: ['Brake Pads', 'Engine Oil'],
        estimatedCost: 3500,
        notes: 'Regular service',
        createdAt: new Date().toISOString()
    },
    {
        id: '3',
        jobNo: 'JC-003',
        date: '2026-01-13',
        customer: 'Amit Patel',
        phone: '9988776655',
        bikeModel: 'Yamaha R15 V4',
        status: 'Pending',
        mechanic: 'Arjun',
        services: ['Chain Cleaning', 'Oil Change'],
        parts: ['Chain Lube', 'Engine Oil'],
        estimatedCost: 2500,
        notes: 'Routine maintenance',
        createdAt: new Date().toISOString()
    }
];

const mockCustomers = [
    { id: '1', name: 'Rahul Kumar', phone: '9876543210', email: 'rahul@example.com', createdAt: new Date().toISOString() },
    { id: '2', name: 'Priya Sharma', phone: '9123456780', email: 'priya@example.com', createdAt: new Date().toISOString() },
    { id: '3', name: 'Amit Patel', phone: '9988776655', email: 'amit@example.com', createdAt: new Date().toISOString() }
];

const mockBikes = [
    { id: '1', brand: 'Royal Enfield', model: 'Classic 350', engineOil: '2.5L', oilGrade: '15W-50', tyreFront: '22 PSI', tyreRear: '32 PSI' },
    { id: '2', brand: 'Honda', model: 'Activa 6G', engineOil: '0.7L', oilGrade: '10W-30', tyreFront: '22 PSI', tyreRear: '36 PSI' },
    { id: '3', brand: 'Yamaha', model: 'R15 V4', engineOil: '1.05L', oilGrade: '10W-40', tyreFront: '28 PSI', tyreRear: '33 PSI' },
    { id: '4', brand: 'Hero', model: 'Splendor Plus', engineOil: '0.9L', oilGrade: '10W-30', tyreFront: '25 PSI', tyreRear: '35 PSI' },
    { id: '5', brand: 'KTM', model: 'Duke 390', engineOil: '1.7L', oilGrade: '15W-50', tyreFront: '29 PSI', tyreRear: '29 PSI' }
];

// Routes

// Health check
app.get('/api/health', (req, res) => {
    res.json({ status: 'OK', message: 'Mock backend running' });
});

// Auth routes
app.post('/api/auth/login', (req, res) => {
    const { username, password } = req.body;

    if (username === 'admin' && password === '123') {
        res.json({
            user: mockUser,
            token: 'mock-jwt-token-12345'
        });
    } else {
        res.status(401).json({ error: 'Invalid credentials' });
    }
});

app.get('/api/auth/me', (req, res) => {
    res.json(mockUser);
});

// Jobs routes
app.get('/api/jobs', (req, res) => {
    res.json(mockJobs);
});

app.get('/api/jobs/:id', (req, res) => {
    const job = mockJobs.find(j => j.id === req.params.id);
    if (job) {
        res.json(job);
    } else {
        res.status(404).json({ error: 'Job not found' });
    }
});

app.post('/api/jobs', (req, res) => {
    const newJob = {
        id: String(mockJobs.length + 1),
        jobNo: `JC-${String(mockJobs.length + 1).padStart(3, '0')}`,
        ...req.body,
        createdAt: new Date().toISOString()
    };
    mockJobs.push(newJob);
    res.status(201).json(newJob);
});

app.patch('/api/jobs/:id/status', (req, res) => {
    const { status } = req.body;
    const jobIndex = mockJobs.findIndex(j => j.id === req.params.id);

    if (jobIndex === -1) {
        return res.status(404).json({ error: 'Job not found' });
    }

    mockJobs[jobIndex] = {
        ...mockJobs[jobIndex],
        status,
        updatedAt: new Date().toISOString()
    };

    res.json(mockJobs[jobIndex]);
});

// Customers Routes
app.get('/api/customers', (req, res) => {
    res.json(mockCustomers);
});

app.post('/api/customers', (req, res) => {
    const newCustomer = {
        id: String(mockCustomers.length + 1),
        createdAt: new Date().toISOString(),
        ...req.body
    };
    mockCustomers.push(newCustomer);
    res.status(201).json(newCustomer);
});

app.delete('/api/customers/:id', (req, res) => {
    const index = mockCustomers.findIndex(c => c.id === req.params.id);
    if (index !== -1) {
        mockCustomers.splice(index, 1);
        res.status(204).send();
    } else {
        res.status(404).json({ error: 'Customer not found' });
    }
});

app.put('/api/customers/:id', (req, res) => {
    const index = mockCustomers.findIndex(c => c.id === req.params.id);
    if (index !== -1) {
        mockCustomers[index] = { ...mockCustomers[index], ...req.body };
        res.json(mockCustomers[index]);
    } else {
        res.status(404).json({ error: 'Customer not found' });
    }
});

// Bike DB Routes
app.get('/api/bikes', (req, res) => {
    res.json(mockBikes);
});

app.post('/api/bikes', (req, res) => {
    const newBike = {
        id: String(mockBikes.length + 1),
        ...req.body
    };
    mockBikes.push(newBike);
    res.status(201).json(newBike);
});

app.delete('/api/bikes/:id', (req, res) => {
    const index = mockBikes.findIndex(b => b.id === req.params.id);
    if (index !== -1) {
        mockBikes.splice(index, 1);
        res.status(204).send();
    } else {
        res.status(404).json({ error: 'Bike not found' });
    }
});

app.put('/api/bikes/:id', (req, res) => {
    const index = mockBikes.findIndex(b => b.id === req.params.id);
    if (index !== -1) {
        mockBikes[index] = { ...mockBikes[index], ...req.body };
        res.json(mockBikes[index]);
    } else {
        res.status(404).json({ error: 'Bike not found' });
    }
});

// Time Clock Mock Data
const mockTimeEntries = [
    { id: '1', employeeName: 'Arjun', type: 'Clock In', time: '2026-01-13T09:00:00.000Z' },
    { id: '2', employeeName: 'Vikram', type: 'Clock In', time: '2026-01-13T09:15:00.000Z' },
    { id: '3', employeeName: 'Arjun', type: 'Clock Out', time: '2026-01-13T13:00:00.000Z' },
    { id: '4', employeeName: 'Arjun', type: 'Clock In', time: '2026-01-13T14:00:00.000Z' }
];

// ... (Bike DB Routes logic)

// Time Clock Routes
app.get('/api/timeclock', (req, res) => {
    res.json(mockTimeEntries);
});

app.post('/api/timeclock', (req, res) => {
    const newEntry = {
        id: String(mockTimeEntries.length + 1),
        time: new Date().toISOString(),
        ...req.body
    };
    mockTimeEntries.unshift(newEntry); // Add to beginning
    res.status(201).json(newEntry);
});

// Services Mock Data
const mockServices = [
    { id: '1', name: 'General Service', category: 'Routine', price: 650, duration: '2 hours', description: 'Complete checkup, oil change, and wash' },
    { id: '2', name: 'Engine Oil Change', category: 'Maintenance', price: 150, duration: '30 mins', description: 'Drain old oil and refill with new grade oil' },
    { id: '3', name: 'Brake Pad Replacement', category: 'Repair', price: 250, duration: '45 mins', description: 'Front/Rear brake pad replacement and calibration' },
    { id: '4', name: 'Chain Cleaning & Lube', category: 'Maintenance', price: 200, duration: '30 mins', description: 'Deep cleaning of chain and lubrication' },
    { id: '5', name: 'Full Engine Overhaul', category: 'Major Repair', price: 4500, duration: '2 days', description: 'Complete engine dismantling and rebuilding' }
];

// ... (Time Clock Routes logic)

// Services Routes
app.get('/api/services', (req, res) => {
    res.json(mockServices);
});

app.post('/api/services', (req, res) => {
    constnewService = {
        id: String(mockServices.length + 1),
        ...req.body
    };
    mockServices.push(newService);
    res.status(201).json(newService);
});

app.put('/api/services/:id', (req, res) => {
    const index = mockServices.findIndex(s => s.id === req.params.id);
    if (index !== -1) {
        mockServices[index] = { ...mockServices[index], ...req.body };
        res.json(mockServices[index]);
    } else {
        res.status(404).json({ error: 'Service not found' });
    }
});

app.delete('/api/services/:id', (req, res) => {
    const index = mockServices.findIndex(s => s.id === req.params.id);
    if (index !== -1) {
        mockServices.splice(index, 1);
        res.status(204).send();
    } else {
        res.status(404).json({ error: 'Service not found' });
    }
});

// Reports routes
app.get('/api/reports/revenue', (req, res) => {
    const totalRevenue = mockJobs.reduce((sum, job) => sum + (job.estimatedCost || 0), 0);
    res.json({
        totalRevenue,
        jobCount: mockJobs.length,
        avgRevenue: totalRevenue / mockJobs.length
    });
});

// Start server
app.listen(PORT, () => {
    console.log(`🚀 Mock backend running on http://localhost:${PORT}`);
    console.log(`📝 Login with: admin / 123`);
    console.log(`💾 Using in-memory data (no persistence)`);
});
