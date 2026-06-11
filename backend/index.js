const express = require('express');
const cors = require('cors');
const path = require('path');

// Load environment variables relative to this directory
require('dotenv').config({ path: path.join(__dirname, '.env') });

// Provide safe environment fallbacks for development
if (!process.env.JWT_SECRET) {
  console.warn("WARNING: JWT_SECRET environment variable is not set! Using a default development key.");
  process.env.JWT_SECRET = "supersecretkey12345!@#";
}
if (!process.env.DATABASE_URL) {
  console.warn("WARNING: DATABASE_URL is not set! Using default 'file:./dev.db'.");
  process.env.DATABASE_URL = "file:./dev.db";
}

const authRoutes = require('./routes/auth');
const expenseRoutes = require('./routes/expenses');
const incomeRoutes = require('./routes/incomes');
const budgetRoutes = require('./routes/budgets');
const tripRoutes = require('./routes/trips');

const app = express();

app.use(cors({
  origin: process.env.FRONTEND_URL || '*',
  credentials: true
}));
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/expenses', expenseRoutes);
app.use('/api/incomes', incomeRoutes);
app.use('/api/budgets', budgetRoutes);
app.use('/api/trips', tripRoutes);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
