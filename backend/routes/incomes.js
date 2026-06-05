const express = require('express');
const router = express.Router();
const prisma = require('../db');
const auth = require('../middleware/auth');

// @route   GET api/incomes
// @desc    Get all user incomes
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const incomes = await prisma.income.findMany({
      where: { userId: req.user.id },
      orderBy: { date: 'desc' },
    });
    res.json(incomes);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   POST api/incomes
// @desc    Add new income
// @access  Private
router.post('/', auth, async (req, res) => {
  const { source, amount, date } = req.body;

  try {
    const newIncome = await prisma.income.create({
      data: {
        source,
        amount: parseFloat(amount),
        date: new Date(date),
        userId: req.user.id,
      },
    });

    res.json(newIncome);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   PUT api/incomes/:id
// @desc    Update income
// @access  Private
router.put('/:id', auth, async (req, res) => {
  const { source, amount, date } = req.body;

  try {
    let income = await prisma.income.findUnique({ where: { id: req.params.id } });

    if (!income) return res.status(404).json({ msg: 'Income not found' });
    if (income.userId !== req.user.id) return res.status(401).json({ msg: 'Not authorized' });

    income = await prisma.income.update({
      where: { id: req.params.id },
      data: {
        source: source || income.source,
        amount: amount ? parseFloat(amount) : income.amount,
        date: date ? new Date(date) : income.date,
      },
    });

    res.json(income);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   DELETE api/incomes/:id
// @desc    Delete income
// @access  Private
router.delete('/:id', auth, async (req, res) => {
  try {
    let income = await prisma.income.findUnique({ where: { id: req.params.id } });

    if (!income) return res.status(404).json({ msg: 'Income not found' });
    if (income.userId !== req.user.id) return res.status(401).json({ msg: 'Not authorized' });

    await prisma.income.delete({ where: { id: req.params.id } });

    res.json({ msg: 'Income removed' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;
