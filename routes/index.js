const express = require('express');
const router = express.Router();
const Prediction = require('../models/Prediction');

// Middleware to check if user is authenticated
const requireAuth = (req, res, next) => {
  if (!req.session.userId) {
    return res.redirect('/auth/login');
  }
  next();
};

router.get('/', (req, res) => {
  res.render('index', { title: 'Heart Arrhythmia Classification' });
});

router.get('/about', (req, res) => {
  res.render('about');
});

router.get('/objectives', (req, res) => {
  res.render('objectives');
});

router.get('/techniques', (req, res) => {
  res.render('techniques');
});

router.get('/implementation', (req, res) => {
  res.render('implementation');
});

router.get('/results', requireAuth, async (req, res) => {
  const recent = await Prediction.find().sort({ uploadDate: -1 }).limit(10).lean();
  res.render('results', { recent });
});

router.get('/predict', requireAuth, (req, res) => {
  res.render('predict');
});

router.get('/conclusion', (req, res) => {
  res.render('conclusion');
});

router.get('/references', (req, res) => {
  res.render('references');
});

module.exports = router;
