-- ═══════════════════════════════════════════════════════════════════════════
-- Migration 002: Newsletter e Contact Forms
-- ═══════════════════════════════════════════════════════════════════════════

-- ─── Newsletter Subscribers ────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS newsletter_subscribers (
  id VARCHAR(36) PRIMARY KEY,
  email VARCHAR(255) NOT NULL UNIQUE,
  status ENUM('subscribed', 'unsubscribed', 'bounced') DEFAULT 'subscribed',
  subscribedAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  unsubscribedAt TIMESTAMP NULL,
  lastEmailSentAt TIMESTAMP NULL,
  metadata JSON,
  createdAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  INDEX idx_email (email),
  INDEX idx_status (status),
  INDEX idx_subscribedAt (subscribedAt),
  FULLTEXT INDEX idx_email_search (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ─── Contact Messages ─────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS contact_messages (
  id VARCHAR(36) PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(20),
  subject VARCHAR(200) NOT NULL,
  message LONGTEXT NOT NULL,
  status ENUM('new', 'responded', 'resolved', 'spam') DEFAULT 'new',
  adminReply LONGTEXT,
  respondedAt TIMESTAMP NULL,
  createdAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  INDEX idx_email (email),
  INDEX idx_status (status),
  INDEX idx_createdAt (createdAt),
  FULLTEXT INDEX idx_message_search (name, subject, message)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ─── Views para Analytics ─────────────────────────────────────────────────

CREATE VIEW IF NOT EXISTS newsletter_stats AS
SELECT
  status,
  COUNT(*) as total,
  DATE(subscribedAt) as date
FROM newsletter_subscribers
GROUP BY status, DATE(subscribedAt);

CREATE VIEW IF NOT EXISTS contact_stats AS
SELECT
  status,
  COUNT(*) as total,
  DATE(createdAt) as date
FROM contact_messages
GROUP BY status, DATE(createdAt);
