const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
const session = require('express-session');
const app = express();

// Load environment variables from process.env (user can set MONGODB_URI)
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/ecg_app';

// Connect to MongoDB
mongoose.connect(MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => console.log('MongoDB connected')).catch(err => console.error('MongoDB error:', err));

// Middlewares
app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(session({
  secret: process.env.SESSION_SECRET || 'ecg_secret_key_2025',
  resave: false,
  saveUninitialized: false,
  cookie: { maxAge: 1000 * 60 * 60 * 24 }
}));
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Static folders
app.use('/public', express.static(path.join(__dirname, 'public')));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Middleware to pass user to views
app.use((req, res, next) => {
  res.locals.user = req.session.username || null;
  next();
});

// Routes
const indexRouter = require('./routes/index');
const apiRouter = require('./routes/api');
const authRouter = require('./routes/auth');
app.use('/', indexRouter);
app.use('/api', apiRouter);
app.use('/auth', authRouter);

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
