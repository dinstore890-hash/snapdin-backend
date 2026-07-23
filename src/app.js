require('dotenv').config();

const express    = require('express');
const helmet     = require('helmet');
const cors       = require('cors');
const compression = require('compression');
const morgan     = require('morgan');

const corsOptions    = require('./config/cors');
const rateLimiter    = require('./middleware/rateLimiter');
const errorHandler   = require('./middleware/errorHandler');
const healthRoutes   = require('./routes/health');
const downloadRoutes = require('./routes/download');

const app = express();

// ── Security & utility middleware ─────────────────────────────────────────────
app.use(helmet());
app.use(cors(corsOptions));
app.use(compression());
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));
app.use(express.json());
app.use(rateLimiter);

// ── Routes ────────────────────────────────────────────────────────────────────
app.use('/', healthRoutes);
app.use('/api', downloadRoutes);

// ── Global error handler (must be registered last) ────────────────────────────
app.use(errorHandler);

module.exports = app;
