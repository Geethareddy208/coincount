const express = require('express');
const router = express.Router();
const prisma = require('../db');
const auth = require('../middleware/auth');

// @route   GET api/trips
// @desc    Get all user trips
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const trips = await prisma.trip.findMany({
      where: { userId: req.user.id },
      include: { expenses: true },
      orderBy: { startDate: 'desc' },
    });
    res.json(trips);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   POST api/trips
// @desc    Add new trip
// @access  Private
router.post('/', auth, async (req, res) => {
  const { name, destination, startDate, endDate, budget } = req.body;

  try {
    const newTrip = await prisma.trip.create({
      data: {
        name,
        destination,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        budget: budget ? parseFloat(budget) : null,
        userId: req.user.id,
      },
    });

    res.json(newTrip);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   PUT api/trips/:id
// @desc    Update trip
// @access  Private
router.put('/:id', auth, async (req, res) => {
  const { name, destination, startDate, endDate, budget } = req.body;

  try {
    let trip = await prisma.trip.findUnique({ where: { id: req.params.id } });

    if (!trip) return res.status(404).json({ msg: 'Trip not found' });
    if (trip.userId !== req.user.id) return res.status(401).json({ msg: 'Not authorized' });

    trip = await prisma.trip.update({
      where: { id: req.params.id },
      data: {
        name: name || trip.name,
        destination: destination || trip.destination,
        startDate: startDate ? new Date(startDate) : trip.startDate,
        endDate: endDate ? new Date(endDate) : trip.endDate,
        budget: budget !== undefined ? parseFloat(budget) : trip.budget,
      },
    });

    res.json(trip);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   DELETE api/trips/:id
// @desc    Delete trip
// @access  Private
router.delete('/:id', auth, async (req, res) => {
  try {
    let trip = await prisma.trip.findUnique({ where: { id: req.params.id } });

    if (!trip) return res.status(404).json({ msg: 'Trip not found' });
    if (trip.userId !== req.user.id) return res.status(401).json({ msg: 'Not authorized' });

    await prisma.trip.delete({ where: { id: req.params.id } });

    res.json({ msg: 'Trip removed' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;
