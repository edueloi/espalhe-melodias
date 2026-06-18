-- ══════════════════════════════════════════════════════════════════════════════
-- Blog & Events System — SQL Migrations
-- ══════════════════════════════════════════════════════════════════════════════

USE `espalhe_melodias`;

-- ─── Blog Categories Table ────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS `blog_categories` (
  `id`           CHAR(36)      NOT NULL PRIMARY KEY,
  `name`         VARCHAR(100)  NOT NULL UNIQUE,
  `slug`         VARCHAR(100)  NOT NULL UNIQUE,
  `description`  TEXT,
  `icon`         VARCHAR(50),
  `color`        VARCHAR(20),
  `order_rank`   INT           DEFAULT 0,
  `post_count`   INT           DEFAULT 0,
  `created_at`   DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at`   DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  INDEX `idx_cat_slug` (`slug`),
  INDEX `idx_cat_order` (`order_rank`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ─── Event Categories Table ───────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS `event_categories` (
  `id`           CHAR(36)      NOT NULL PRIMARY KEY,
  `name`         VARCHAR(100)  NOT NULL UNIQUE,
  `slug`         VARCHAR(100)  NOT NULL UNIQUE,
  `description`  TEXT,
  `icon`         VARCHAR(50),
  `color`        VARCHAR(20),
  `order_rank`   INT           DEFAULT 0,
  `event_count`  INT           DEFAULT 0,
  `created_at`   DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,

  INDEX `idx_evt_cat_slug` (`slug`),
  INDEX `idx_evt_cat_order` (`order_rank`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ─── Enhance blog_posts Table ─────────────────────────────────────────────────

-- Adicionar colunas se não existirem (use em migrate.js)
-- ALTER TABLE blog_posts ADD COLUMN slug VARCHAR(300) UNIQUE;
-- ALTER TABLE blog_posts ADD COLUMN status ENUM('draft','published','archived') DEFAULT 'draft';
-- ALTER TABLE blog_posts ADD COLUMN seo_title VARCHAR(160);
-- ALTER TABLE blog_posts ADD COLUMN seo_description VARCHAR(160);
-- ALTER TABLE blog_posts ADD COLUMN seo_keywords VARCHAR(300);
-- ALTER TABLE blog_posts ADD COLUMN og_image_url TEXT;
-- ALTER TABLE blog_posts ADD COLUMN featured TINYINT(1) DEFAULT 0;
-- ALTER TABLE blog_posts ADD COLUMN featured_until DATETIME;
-- ALTER TABLE blog_posts ADD COLUMN views_count INT DEFAULT 0;
-- ALTER TABLE blog_posts ADD COLUMN published_at DATETIME;
-- ALTER TABLE blog_posts ADD COLUMN category_id CHAR(36);

-- Adicionar índices e fulltext
-- ALTER TABLE blog_posts ADD INDEX idx_blog_slug (slug);
-- ALTER TABLE blog_posts ADD INDEX idx_blog_featured (featured, featured_until);
-- ALTER TABLE blog_posts ADD FULLTEXT INDEX idx_blog_search (title, content);
-- ALTER TABLE blog_posts ADD CONSTRAINT fk_blog_category FOREIGN KEY (category_id)
--   REFERENCES blog_categories(id) ON DELETE CASCADE;

-- ─── Enhance health_events Table ──────────────────────────────────────────────

-- ALTER TABLE health_events ADD COLUMN slug VARCHAR(300);
-- ALTER TABLE health_events ADD COLUMN category_id CHAR(36);
-- ALTER TABLE health_events ADD COLUMN event_capacity INT DEFAULT 0;
-- ALTER TABLE health_events ADD COLUMN waitlist_count INT DEFAULT 0;
-- ALTER TABLE health_events ADD COLUMN seo_description VARCHAR(300);
-- ALTER TABLE health_events ADD COLUMN thumbnail_url TEXT;
-- ALTER TABLE health_events ADD COLUMN status_enum ENUM('draft','upcoming','ongoing','past','cancelled') DEFAULT 'draft';
-- ALTER TABLE health_events ADD COLUMN registration_deadline DATETIME;

-- ALTER TABLE health_events ADD INDEX idx_event_slug (slug);
-- ALTER TABLE health_events ADD INDEX idx_event_status_enum (status_enum);
-- ALTER TABLE health_events ADD CONSTRAINT fk_event_category FOREIGN KEY (category_id)
--   REFERENCES event_categories(id) ON DELETE SET NULL;

-- ─── Initial Categories Data ──────────────────────────────────────────────────

-- Blog Categories
INSERT IGNORE INTO `blog_categories`
  (`id`, `name`, `slug`, `description`, `icon`, `color`, `order_rank`)
VALUES
  (UUID(), 'Saúde Mental', 'saude-mental', 'Dicas e informações sobre saúde mental e bem-estar emocional', 'heart', 'rose', 1),
  (UUID(), 'Meditação', 'meditacao', 'Técnicas e práticas de meditação', 'meditation', 'teal', 2),
  (UUID(), 'Yoga', 'yoga', 'Asanas, pranayama e filosofia do yoga', 'yoga', 'amber', 3),
  (UUID(), 'Nutrição', 'nutricao', 'Nutrição saudável e receitas', 'apple', 'moss', 4),
  (UUID(), 'Bem-estar', 'bem-estar', 'Dicas de bem-estar geral', 'star', 'navy', 5);

-- Event Categories
INSERT IGNORE INTO `event_categories`
  (`id`, `name`, `slug`, `description`, `icon`, `color`, `order_rank`)
VALUES
  (UUID(), 'Workshop', 'workshop', 'Workshops práticos e interativos', 'video', 'clay', 1),
  (UUID(), 'Palestra', 'palestra', 'Palestras e conferências', 'speaker', 'navy', 2),
  (UUID(), 'Grupo de Apoio', 'grupo-apoio', 'Grupos de apoio comunitário', 'users', 'rose', 3),
  (UUID(), 'Meditação Coletiva', 'meditacao-coletiva', 'Sessões coletivas de meditação', 'meditation', 'teal', 4),
  (UUID(), 'Webinar', 'webinar', 'Sessões online ao vivo', 'globe', 'amber', 5);

-- ─── Query Examples ───────────────────────────────────────────────────────────

-- Buscar posts por categoria
-- SELECT bp.*, bc.name as category_name
-- FROM blog_posts bp
-- LEFT JOIN blog_categories bc ON bp.category_id = bc.id
-- WHERE bp.status = 'published'
-- ORDER BY bp.post_date DESC;

-- Buscar eventos por categoria com contagem de vagas
-- SELECT he.*, ec.name as category_name,
--        (he.event_capacity - he.participants_count) as available_slots
-- FROM health_events he
-- LEFT JOIN event_categories ec ON he.category_id = ec.id
-- WHERE he.status_enum IN ('upcoming', 'ongoing')
-- ORDER BY he.event_date ASC;

-- Posts em destaque (featured)
-- SELECT * FROM blog_posts
-- WHERE featured = 1
--   AND (featured_until IS NULL OR featured_until > NOW())
--   AND status = 'published'
-- ORDER BY post_date DESC
-- LIMIT 5;

-- Eventos com disponibilidade
-- SELECT id, title, event_date, event_time,
--        participants_count, event_capacity,
--        (event_capacity - participants_count) as available_slots,
--        CASE
--          WHEN event_capacity = 0 THEN 'Ilimitado'
--          WHEN participants_count >= event_capacity THEN 'Lotado'
--          ELSE CONCAT(event_capacity - participants_count, ' vagas')
--        END as status_capacity
-- FROM health_events
-- WHERE status_enum = 'upcoming'
-- ORDER BY event_date;
