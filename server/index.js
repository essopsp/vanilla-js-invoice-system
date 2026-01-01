import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import cors from 'cors';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.join(__dirname, '..');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Serve static files from the root directory
app.use(express.static(rootDir));

// API Routes
import customerRoutes from './routes/customers.js';
import paymentRoutes from './routes/payments.js'; // Renamed from receipts.js
import invoiceRoutes from './routes/invoices.js';
import delegateRoutes from './routes/delegates.js';
import dashboardRoutes from './routes/dashboard.js';
import reportRoutes from './routes/reports.js';

app.use('/api/customers', customerRoutes);
app.use('/api/payments', paymentRoutes); // Renamed endpoint
app.use('/api/invoices', invoiceRoutes);
app.use('/api/delegates', delegateRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/reports', reportRoutes);

// Fallback to index.html for SPA routing
app.get('*', (req, res) => {
    res.sendFile(path.join(rootDir, 'index.html'));
});

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
