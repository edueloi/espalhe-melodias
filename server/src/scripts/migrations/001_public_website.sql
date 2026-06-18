-- ════════════════════════════════════════════════════════════════════════════
-- Migration: Public Website Tables
-- Criação das tabelas para o site público do Espalhe Melodias
-- ════════════════════════════════════════════════════════════════════════════

-- ─── Newsletter Subscribers ──────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS `newsletter_subscribers` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `email` VARCHAR(255) NOT NULL UNIQUE,
  `dateSubscribed` DATETIME NOT NULL,
  `isActive` BOOLEAN NOT NULL DEFAULT true,
  `unsubscribeToken` VARCHAR(64) UNIQUE,
  `createdAt` DATETIME NOT NULL,
  `updatedAt` DATETIME NOT NULL,

  INDEX `idx_email` (`email`),
  INDEX `idx_isActive` (`isActive`),
  INDEX `idx_unsubscribeToken` (`unsubscribeToken`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ─── Contact Messages ───────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS `contact_messages` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(255) NOT NULL,
  `email` VARCHAR(255) NOT NULL,
  `phone` VARCHAR(20),
  `message` TEXT NOT NULL,
  `status` ENUM('new', 'read', 'replied', 'archived') NOT NULL DEFAULT 'new',
  `createdAt` DATETIME NOT NULL,
  `updatedAt` DATETIME NOT NULL,

  INDEX `idx_email` (`email`),
  INDEX `idx_status` (`status`),
  INDEX `idx_createdAt` (`createdAt`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ─── Event Inscriptions ─────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS `event_inscriptions` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `userId` INT NOT NULL,
  `eventId` INT NOT NULL,
  `status` ENUM('registered', 'confirmed', 'cancelled') NOT NULL DEFAULT 'registered',
  `checkedInAt` DATETIME,
  `createdAt` DATETIME NOT NULL,
  `updatedAt` DATETIME NOT NULL,

  UNIQUE KEY `unique_user_event` (`userId`, `eventId`),
  FOREIGN KEY `fk_user` (`userId`) REFERENCES `app_users`(`id`) ON DELETE CASCADE,
  FOREIGN KEY `fk_event` (`eventId`) REFERENCES `health_events`(`id`) ON DELETE CASCADE,

  INDEX `idx_status` (`status`),
  INDEX `idx_userId` (`userId`),
  INDEX `idx_eventId` (`eventId`),
  INDEX `idx_createdAt` (`createdAt`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ─── Blog Categories (se não existir) ────────────────────────────────────

CREATE TABLE IF NOT EXISTS `blog_categories` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(100) NOT NULL UNIQUE,
  `slug` VARCHAR(100) NOT NULL UNIQUE,
  `color` VARCHAR(7) NOT NULL DEFAULT '#6366f1',
  `description` TEXT,
  `createdAt` DATETIME NOT NULL,
  `updatedAt` DATETIME NOT NULL,

  INDEX `idx_slug` (`slug`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ════════════════════════════════════════════════════════════════════════════
-- Fim da migration
-- ════════════════════════════════════════════════════════════════════════════
