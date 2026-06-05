const express = require('express');
const router = express.Router();
const prisma = require('../db');
const auth = require('../middleware/auth');

// @route   GET api/budgets
// @desc    Get user budgets for a specific month and year
// @access  Private
router.get('/', auth, async (req, res) => {
  const { month, year } = req.query;
  try {
    const budgets = await prisma.budget.findMany({
      where: {
        userId: req.user.id,
        month: month ? parseInt(month) : new Date().getMonth() + 1,
        year: year ? parseInt(year) : new Date().getFullYear(),
      },
    });
    res.json(budgets);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   POST api/budgets
// @desc    Add or update budget
// @access  Private
router.post('/', auth, async (req, res) => {
  const { category, amount, month, year } = req.body;

  try {
    const m = month ? parseInt(month) : new Date().getMonth() + 1;
    const y = year ? parseInt(year) : new Date().getFullYear();

    const budget = await prisma.budget.upsert({
      where: {
        userId_category_month_year: {
          userId: req.user.id,
          category,
          month: m,
          year: y,
        },
      },
      update: {
        amount: parseFloat(amount),
      },
      create: {
        category,
        amount: parseFloat(amount),
        month: m,
        year: y,
        userId: req.user.id,
      },
    });

    res.json(budget);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;
