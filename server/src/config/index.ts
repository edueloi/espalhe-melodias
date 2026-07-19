import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

function required(key: string): string {
  const value = process.env[key];
  if (!value) throw new Error(`Missing required env var: ${key}`);
  return value;
}

export const config = {
  port: parseInt(process.env.PORT ?? '3001', 10),
  nodeEnv: process.env.NODE_ENV ?? 'development',
  isDev: (process.env.NODE_ENV ?? 'development') === 'development',

  jwt: {
    secret: required('JWT_SECRET'),
    expiresIn: process.env.JWT_EXPIRES_IN ?? '7d',
    refreshSecret: required('JWT_REFRESH_SECRET'),
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN ?? '30d',
  },

  cors: {
    origin: process.env.CORS_ORIGIN ?? 'http://localhost:3000',
  },

  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS ?? '900000', 10),
    max: parseInt(process.env.RATE_LIMIT_MAX ?? '100', 10),
  },

  db: {
    host:            process.env.DB_HOST              ?? 'localhost',
    port:            parseInt(process.env.DB_PORT     ?? '3306', 10),
    user:            process.env.DB_USER              ?? 'root',
    password:        process.env.DB_PASSWORD          ?? '',
    name:            process.env.DB_NAME              ?? 'espalhe_melodias',
    connectionLimit: parseInt(process.env.DB_CONNECTION_LIMIT ?? '10', 10),
  },

  admin: {
    email:    process.env.DEFAULT_ADMIN_EMAIL    ?? 'karen.adm@melodias.com.br',
    password: process.env.DEFAULT_ADMIN_PASSWORD ?? 'melodias2026',
  },

  instagram: {
    businessAccountId: process.env.INSTAGRAM_BUSINESS_ACCOUNT_ID ?? '',
    accessToken: process.env.INSTAGRAM_ACCESS_TOKEN ?? '',
    cacheTTL: parseInt(process.env.INSTAGRAM_CACHE_TTL ?? '3600', 10),
    apiVersion: process.env.INSTAGRAM_API_VERSION ?? 'v18.0',
  },

  email: {
    provider: process.env.EMAIL_PROVIDER ?? 'smtp', // 'smtp' | 'local' | 'sendgrid' | 'mailchimp'
    from: process.env.EMAIL_FROM ?? 'contato@espalhemelodias.com.br',
    fromName: process.env.EMAIL_FROM_NAME ?? 'Espalhe Melodias',
    smtp: {
      host: process.env.SMTP_HOST ?? 'smtp.hostinger.com',
      port: parseInt(process.env.SMTP_PORT ?? '465', 10),
      secure: (process.env.SMTP_SECURE ?? 'true') === 'true',
      user: process.env.SMTP_USER ?? '',
      password: process.env.SMTP_PASSWORD ?? '',
    },
    sendgrid: {
      apiKey: process.env.SENDGRID_API_KEY ?? '',
    },
    mailchimp: {
      apiKey: process.env.MAILCHIMP_API_KEY ?? '',
      listId: process.env.MAILCHIMP_LIST_ID ?? '',
    },
  },

  contact: {
    adminEmails: process.env.CONTACT_ADMIN_EMAILS ?? process.env.DEFAULT_ADMIN_EMAIL,
  },

  appUrl: process.env.APP_URL ?? 'http://localhost:3000',
};
