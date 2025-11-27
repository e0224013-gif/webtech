const express = require('express');
const router = express.Router();
const User = require('../models/User');

// GET /auth/login
router.get('/login', (req, res) => {
  res.render('login');
});

// GET /auth/register
router.get('/register', (req, res) => {
  res.render('register');
});

// POST /auth/register
router.post('/register', async (req, res) => {
  try {
    const { username, email, password, confirmPassword } = req.body;
    if (!username || !email || !password || !confirmPassword) {
      return res.status(400).render('register', { error: 'All fields required' });
    }
    if (password !== confirmPassword) {
      return res.status(400).render('register', { error: 'Passwords do not match' });
    }
    const existing = await User.findOne({ $or: [{ username }, { email }] });
    if (existing) {
      return res.status(400).render('register', { error: 'Username or email already exists' });
    }
    const user = new User({ username, email, password });
    await user.save();
    req.session.userId = user._id;
    req.session.username = user.username;
    res.redirect('/');
  } catch (err) {
    console.error(err);
    res.status(500).render('register', { error: 'Server error' });
  }
});

// POST /auth/login
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).render('login', { error: 'Username and password required' });
    }
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(401).render('login', { error: 'Invalid credentials' });
    }
    const valid = await user.comparePassword(password);
    if (!valid) {
      return res.status(401).render('login', { error: 'Invalid credentials' });
    }
    req.session.userId = user._id;
    req.session.username = user.username;
    res.redirect('/');
  } catch (err) {
    console.error(err);
    res.status(500).render('login', { error: 'Server error' });
  }
});

// GET /auth/logout
router.get('/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) return res.status(500).json({ error: 'Logout failed' });
    res.redirect('/');
  });
});

module.exports = router;
