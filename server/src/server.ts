import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';

import { config } from './config';
import { testConnection } from './config/db';
import { errorHandler, notFound } from './middleware/errorHandler';

import authRoutes          from './routes/auth';
import usersRoutes         from './routes/users';
import preferencesRoutes   from './routes/preferences';
import forumRoutes         from './routes/forum';
import materialsRoutes     from './routes/materials';
import eventsRoutes        from './routes/events';
import helpRoutes          from './routes/help';
import suggestionsRoutes   from './routes/suggestions';
import professionalsRoutes from './routes/professionals';
import blogsRoutes         from './routes/blogs';
import inviteLinksRoutes   from './routes/inviteLinks';

const app = express();

// ─── Security & Utilities ──────────────────────────────────────────────────────

app.use(helmet());
const allowedOrigins = config.cors.origin.split(',').map(o => o.trim());
app.use(cors({
  origin: (origin, cb) => {
    // Permite requests sem origin (mobile, curl, Postman) e origins na lista
    if (!origin || allowedOrigins.includes(origin)) return cb(null, true);
    cb(new Error(`CORS bloqueado: ${origin}`));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(morgan(config.isDev ? 'dev' : 'combined'));

// ─── Rate Limiting ────────────────────────────────────────────────────────────

const limiter = rateLimit({
  windowMs: config.rateLimit.windowMs,
  max:      config.rateLimit.max,
  message:  { success: false, message: 'Muitas requisições. Tente novamente mais tarde.' },
  standardHeaders: true,
  legacyHeaders:   false,
});
app.use('/api', limiter);

// ─── Healthcheck ──────────────────────────────────────────────────────────────

app.get('/health', (_req, res) => {
  res.json({
    success: true,
    service: 'Espalhe Melodias API',
    version: '1.0.0',
    env: config.nodeEnv,
    timestamp: new Date().toISOString(),
  });
});

// ─── Routes ───────────────────────────────────────────────────────────────────

app.use('/api/auth',          authRoutes);
app.use('/api/users',         usersRoutes);
app.use('/api/preferences',   preferencesRoutes);
app.use('/api/forum',         forumRoutes);
app.use('/api/materials',     materialsRoutes);
app.use('/api/events',        eventsRoutes);
app.use('/api/help',          helpRoutes);
app.use('/api/suggestions',   suggestionsRoutes);
app.use('/api/professionals', professionalsRoutes);
app.use('/api/blogs',         blogsRoutes);
app.use('/api/invite-links',  inviteLinksRoutes);

// ─── 404 & Error Handler ──────────────────────────────────────────────────────

app.use(notFound);
app.use(errorHandler);

// ─── Start ────────────────────────────────────────────────────────────────────

async function start() {
  try {
    await testConnection();
    console.log('✅  MySQL conectado');
  } catch (err) {
    console.error('❌  Falha ao conectar ao MySQL:', err);
    process.exit(1);
  }

  app.listen(config.port, () => {
    console.log(`\n🎵  Espalhe Melodias API rodando em http://localhost:${config.port}`);
    console.log(`   Ambiente : ${config.nodeEnv}`);
    console.log(`   CORS     : ${config.cors.origin}\n`);
  });
}

start();

export default app;
