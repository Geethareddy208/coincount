const express = require('express');
const router = express.Router();
const prisma = require('../db');
const auth = require('../middleware/auth');

// @route   GET api/expenses
// @desc    Get all user expenses
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const expenses = await prisma.expense.findMany({
      where: { userId: req.user.id },
      orderBy: { date: 'desc' },
    });
    res.json(expenses);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   POST api/expenses
// @desc    Add new expense
// @access  Private
router.post('/', auth, async (req, res) => {
  const { title, amount, category, date, tripId } = req.body;

  try {
    const newExpense = await prisma.expense.create({
      data: {
        title,
        amount: parseFloat(amount),
        category,
        date: new Date(date),
        userId: req.user.id,
        tripId: tripId || null,
      },
    });

    res.json(newExpense);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   PUT api/expenses/:id
// @desc    Update expense
// @access  Private
router.put('/:id', auth, async (req, res) => {
  const { title, amount, category, date, tripId } = req.body;

  try {
    let expense = await prisma.expense.findUnique({ where: { id: req.params.id } });

    if (!expense) return res.status(404).json({ msg: 'Expense not found' });
    if (expense.userId !== req.user.id) return res.status(401).json({ msg: 'Not authorized' });

    expense = await prisma.expense.update({
      where: { id: req.params.id },
      data: {
        title: title || expense.title,
        amount: amount ? parseFloat(amount) : expense.amount,
        category: category || expense.category,
        date: date ? new Date(date) : expense.date,
        tripId: tripId !== undefined ? tripId : expense.tripId,
      },
    });

    res.json(expense);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   DELETE api/expenses/:id
// @desc    Delete expense
// @access  Private
router.delete('/:id', auth, async (req, res) => {
  try {
    let expense = await prisma.expense.findUnique({ where: { id: req.params.id } });

    if (!expense) return res.status(404).json({ msg: 'Expense not found' });
    if (expense.userId !== req.user.id) return res.status(401).json({ msg: 'Not authorized' });

    await prisma.expense.delete({ where: { id: req.params.id } });

    res.json({ msg: 'Expense removed' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;
