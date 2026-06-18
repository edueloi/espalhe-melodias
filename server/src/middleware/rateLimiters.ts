import rateLimit from 'express-rate-limit';

/**
 * Rate Limiters específicos para Newsletter e Contact Forms
 */

/**
 * Max 1 newsletter signup por IP/dia
 */
export const newsletterLimiter = rateLimit({
  windowMs: 24 * 60 * 60 * 1000, // 24 horas
  max: 1,
  message: { success: false, message: 'Máximo de 1 inscrição na newsletter por dia. Tente novamente amanhã.' },
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => {
    // Pula limite se tem token de admin
    return req.headers.authorization?.startsWith('Bearer') ?? false;
  },
});

/**
 * Max 3 contact messages por IP/dia
 */
export const contactFormLimiter = rateLimit({
  windowMs: 24 * 60 * 60 * 1000, // 24 horas
  max: 3,
  message: { success: false, message: 'Máximo de 3 mensagens por dia. Tente novamente amanhã.' },
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => {
    // Pula limite se tem token de admin
    return req.headers.authorization?.startsWith('Bearer') ?? false;
  },
});

/**
 * Max 5 requisições por IP/minuto (admin)
 */
export const adminLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minuto
  max: 5,
  message: { success: false, message: 'Muitas requisições. Tente novamente em um minuto.' },
  standardHeaders: true,
  legacyHeaders: false,
});
