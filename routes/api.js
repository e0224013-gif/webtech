const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const Prediction = require('../models/Prediction');

// Middleware to check if user is authenticated
const requireAuth = (req, res, next) => {
  if (!req.session.userId) {
    return res.status(401).json({ error: 'Unauthorized. Please login first.' });
  }
  next();
};

// Multer setup
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, '..', 'uploads'));
  },
  filename: function (req, file, cb) {
    const name = Date.now() + '-' + file.originalname.replace(/\s+/g, '_');
    cb(null, name);
  }
});

const upload = multer({ storage: storage, limits: { fileSize: 20 * 1024 * 1024 } });

// Helper: mock prediction
function mockPrediction() {
  const classes = [
    'Normal',
    'Atrial Fibrillation (AF)',
    'Ventricular Tachycardia (VT)',
    'PVC',
    'Bundle Branch Block'
  ];
  const cls = classes[Math.floor(Math.random() * classes.length)];
  const conf = (Math.random() * (99 - 82) + 82).toFixed(1) + '%';
  return { class: cls, confidence: conf };
}

// POST /api/predict
router.post('/predict', requireAuth, upload.single('ecgfile'), async (req, res) => {
  try {
    const file = req.file;
    if (!file) return res.status(400).json({ error: 'No file uploaded' });

    const result = mockPrediction();

    // Save to DB
    const rec = new Prediction({
      filename: file.filename,
      predictedClass: result.class,
      confidence: result.confidence
    });
    await rec.save();

    // Return result
    return res.json({
      filename: file.filename,
      predictedClass: result.class,
      confidence: result.confidence
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /api/predictions
router.get('/predictions', requireAuth, async (req, res) => {
  try {
    const list = await Prediction.find().sort({ uploadDate: -1 }).limit(100).lean();
    res.json(list);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /api/generate
// Generate N random prediction records and store them in MongoDB
router.post('/generate', requireAuth, async (req, res) => {
  try {
    const count = parseInt(req.body.count || req.query.count) || 10;
    const created = [];
    for (let i = 0; i < count; i++) {
      const r = mockPrediction();
      const filename = `sample-${Date.now()}-${i}.csv`;
      const rec = new Prediction({
        filename: filename,
        predictedClass: r.class,
        confidence: r.confidence,
        uploadDate: new Date(Date.now() - Math.floor(Math.random() * 1000 * 60 * 60 * 24 * 30))
      });
      await rec.save();
      created.push(rec);
    }
    res.json({ created: created.length });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
