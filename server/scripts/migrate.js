#!/usr/bin/env node
/**
 * migrate.js — cria/atualiza todas as tabelas do banco espalhe_melodias.
 *
 * Uso:
 *   node scripts/migrate.js
 *
 * Na VPS (produção):
 *   NODE_ENV=production node scripts/migrate.js
 *
 * Requer: mysql2, dotenv  (npm install no diretório server/ antes de rodar)
 */

'use strict';

const path   = require('path');
const mysql  = require('mysql2/promise');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

const cfg = {
  host:               process.env.DB_HOST              ?? 'localhost',
  port:               parseInt(process.env.DB_PORT     ?? '3306', 10),
  user:               process.env.DB_USER              ?? 'root',
  password:           process.env.DB_PASSWORD          ?? '',
  multipleStatements: true,
};

// ─── SQL de criação ───────────────────────────────────────────────────────────

const CREATE_DB = `
CREATE DATABASE IF NOT EXISTS \`espalhe_melodias\`
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;
USE \`espalhe_melodias\`;
`;

const TABLES = `
-- ── Users ────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS users (
  id               CHAR(36)     NOT NULL PRIMARY KEY,
  name             VARCHAR(150) NOT NULL,
  email            VARCHAR(200) NOT NULL UNIQUE,
  password_hash    VARCHAR(255) NOT NULL,
  role             ENUM('super-admin','professional','member') NOT NULL DEFAULT 'member',
  avatar           TEXT,
  specialty        VARCHAR(150),
  crp              VARCHAR(50),
  approval_status  ENUM('approved','pending','rejected')       NOT NULL DEFAULT 'pending',
  last_login_at    DATETIME,
  created_at       DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at       DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_users_email  (email),
  INDEX idx_users_role   (role),
  INDEX idx_users_status (approval_status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ── User Preferences ─────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS user_preferences (
  id                  CHAR(36)  NOT NULL PRIMARY KEY,
  user_id             CHAR(36)  NOT NULL UNIQUE,
  theme               ENUM('light','dark','system')                         NOT NULL DEFAULT 'light',
  accent_color        ENUM('clay','moss','navy','rose','amber','teal')      NOT NULL DEFAULT 'clay',
  font_size           ENUM('sm','md','lg')                                  NOT NULL DEFAULT 'md',
  layout_density      ENUM('compact','comfortable','spacious')              NOT NULL DEFAULT 'comfortable',
  language            ENUM('pt-BR','en-US')                                 NOT NULL DEFAULT 'pt-BR',
  sidebar_collapsed   TINYINT(1) NOT NULL DEFAULT 0,

  -- Notifications (JSON compacto como colunas booleanas)
  notif_forum_reply       TINYINT(1) NOT NULL DEFAULT 1,
  notif_event_reminder    TINYINT(1) NOT NULL DEFAULT 1,
  notif_help_update       TINYINT(1) NOT NULL DEFAULT 1,
  notif_new_material      TINYINT(1) NOT NULL DEFAULT 0,
  notif_push_enabled      TINYINT(1) NOT NULL DEFAULT 0,

  -- Dashboard
  dash_show_welcome       TINYINT(1) NOT NULL DEFAULT 1,
  dash_show_quote         TINYINT(1) NOT NULL DEFAULT 1,
  dash_show_stats         TINYINT(1) NOT NULL DEFAULT 1,
  dash_default_view       ENUM('grid','list')  NOT NULL DEFAULT 'grid',

  -- Filters (JSON — flexível para futuras opções)
  filter_forum            JSON,
  filter_materials        JSON,
  filter_events           JSON,
  filter_directory        JSON,

  -- Bookmarks e enrollments (arrays de IDs em JSON)
  bookmarked_materials    JSON,
  bookmarked_topics       JSON,
  enrolled_events         JSON,

  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  CONSTRAINT fk_pref_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ── Professional Profiles ────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS professional_profiles (
  id                CHAR(36)       NOT NULL PRIMARY KEY,
  user_id           CHAR(36)       NOT NULL UNIQUE,
  crp               VARCHAR(50)    NOT NULL,
  specialties       JSON           NOT NULL,
  bio               TEXT,
  price_per_session DECIMAL(10,2)  NOT NULL DEFAULT 0.00,
  rating            DECIMAL(3,2)   NOT NULL DEFAULT 0.00,
  reviews_count     INT            NOT NULL DEFAULT 0,
  contact_whatsapp  VARCHAR(30),
  services          JSON,
  schedule          JSON,
  location          VARCHAR(200),
  accent_color      VARCHAR(30),
  languages         JSON,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  CONSTRAINT fk_prof_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ── Forum Topics ──────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS forum_topics (
  id           CHAR(36)     NOT NULL PRIMARY KEY,
  title        VARCHAR(300) NOT NULL,
  category     VARCHAR(100) NOT NULL,
  author_id    CHAR(36)     NOT NULL,
  author_name  VARCHAR(150) NOT NULL,
  author_role  ENUM('super-admin','professional','member') NOT NULL,
  author_avatar TEXT,
  content      TEXT         NOT NULL,
  likes        INT          NOT NULL DEFAULT 0,
  liked_by     JSON,
  views        INT          NOT NULL DEFAULT 0,
  is_solved    TINYINT(1)   NOT NULL DEFAULT 0,
  is_pinned    TINYINT(1)   NOT NULL DEFAULT 0,
  is_locked    TINYINT(1)   NOT NULL DEFAULT 0,
  created_at   DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at   DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  INDEX idx_forum_category  (category),
  INDEX idx_forum_author    (author_id),
  INDEX idx_forum_solved    (is_solved),
  CONSTRAINT fk_topic_author FOREIGN KEY (author_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ── Forum Replies ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS forum_replies (
  id              CHAR(36)  NOT NULL PRIMARY KEY,
  topic_id        CHAR(36)  NOT NULL,
  author_id       CHAR(36)  NOT NULL,
  author_name     VARCHAR(150) NOT NULL,
  author_role     ENUM('super-admin','professional','member') NOT NULL,
  author_avatar   TEXT,
  content         TEXT      NOT NULL,
  is_expert_reply TINYINT(1) NOT NULL DEFAULT 0,
  likes           INT        NOT NULL DEFAULT 0,
  liked_by        JSON,
  created_at      DATETIME   NOT NULL DEFAULT CURRENT_TIMESTAMP,

  INDEX idx_reply_topic  (topic_id),
  INDEX idx_reply_author (author_id),
  CONSTRAINT fk_reply_topic  FOREIGN KEY (topic_id)   REFERENCES forum_topics(id) ON DELETE CASCADE,
  CONSTRAINT fk_reply_author FOREIGN KEY (author_id)  REFERENCES users(id)        ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ── Support Materials ─────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS support_materials (
  id                   CHAR(36)     NOT NULL PRIMARY KEY,
  title                VARCHAR(300) NOT NULL,
  category             ENUM('Ansiedade','Depressão','Autocuidado','Relacionamentos','Meditação','Geral') NOT NULL DEFAULT 'Geral',
  type                 ENUM('E-book','PDF','Áudio','Guia de Exercícios','Infográfico')                   NOT NULL DEFAULT 'PDF',
  description          TEXT,
  download_url         TEXT         NOT NULL,
  author_id            CHAR(36)     NOT NULL,
  author_name          VARCHAR(150) NOT NULL,
  restricted_to_members TINYINT(1)  NOT NULL DEFAULT 0,
  download_count       INT          NOT NULL DEFAULT 0,
  date_added           DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at           DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  INDEX idx_mat_category (category),
  INDEX idx_mat_author   (author_id),
  CONSTRAINT fk_mat_author FOREIGN KEY (author_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ── Health Events ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS health_events (
  id                  CHAR(36)     NOT NULL PRIMARY KEY,
  title               VARCHAR(300) NOT NULL,
  instructor_id       CHAR(36)     NOT NULL,
  instructor_name     VARCHAR(150) NOT NULL,
  instructor_avatar   TEXT,
  event_date          DATE         NOT NULL,
  event_time          VARCHAR(10)  NOT NULL,
  description         TEXT,
  category            ENUM('Grupo de Apoio','Palestra Vivencial','Workshop','Meditação Coletiva') NOT NULL,
  status              ENUM('upcoming','past') NOT NULL DEFAULT 'upcoming',
  participants_count  INT          NOT NULL DEFAULT 0,
  enrolled_user_ids   JSON,
  recording_url       TEXT,
  created_at          DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at          DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  INDEX idx_event_status    (status),
  INDEX idx_event_date      (event_date),
  INDEX idx_event_instructor (instructor_id),
  CONSTRAINT fk_event_instructor FOREIGN KEY (instructor_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ── Help Requests ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS help_requests (
  id                       CHAR(36)     NOT NULL PRIMARY KEY,
  patient_id               CHAR(36)     NOT NULL,
  patient_name             VARCHAR(150) NOT NULL,
  patient_email            VARCHAR(200) NOT NULL,
  urgency                  ENUM('baixa','media','alta','urgente') NOT NULL DEFAULT 'media',
  description              TEXT         NOT NULL,
  status                   ENUM('Aberto','Em Atendimento','Concluído') NOT NULL DEFAULT 'Aberto',
  assigned_professional_id CHAR(36),
  assigned_professional    VARCHAR(150),
  notes                    TEXT,
  created_at               DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at               DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  INDEX idx_help_status   (status),
  INDEX idx_help_urgency  (urgency),
  INDEX idx_help_patient  (patient_id),
  CONSTRAINT fk_help_patient FOREIGN KEY (patient_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ── Suggestion Ideas ──────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS suggestion_ideas (
  id           CHAR(36)  NOT NULL PRIMARY KEY,
  author_id    CHAR(36)  NOT NULL,
  author_name  VARCHAR(150) NOT NULL,
  content      TEXT         NOT NULL,
  likes        INT          NOT NULL DEFAULT 0,
  liked_by     JSON,
  status       ENUM('open','in-progress','done','rejected') NOT NULL DEFAULT 'open',
  admin_note   TEXT,
  created_at   DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,

  INDEX idx_sug_status (status),
  INDEX idx_sug_author (author_id),
  CONSTRAINT fk_sug_author FOREIGN KEY (author_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ── Blog Posts ────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS blog_posts (
  id            CHAR(36)     NOT NULL PRIMARY KEY,
  title         VARCHAR(300) NOT NULL,
  excerpt       TEXT,
  content       LONGTEXT     NOT NULL,
  category      VARCHAR(100) NOT NULL,
  image_url     TEXT,
  author_id     CHAR(36)     NOT NULL,
  author_name   VARCHAR(150) NOT NULL,
  author_avatar TEXT,
  read_time     VARCHAR(20),
  likes         INT          NOT NULL DEFAULT 0,
  liked_by      JSON,
  published     TINYINT(1)   NOT NULL DEFAULT 1,
  post_date     DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at    DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  INDEX idx_blog_category  (category),
  INDEX idx_blog_author    (author_id),
  INDEX idx_blog_published (published),
  CONSTRAINT fk_blog_author FOREIGN KEY (author_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ── Event Items (divisão de contribuições) ────────────────────────────────────
CREATE TABLE IF NOT EXISTS event_items (
  id          CHAR(36)     NOT NULL PRIMARY KEY,
  event_id    CHAR(36)     NOT NULL,
  name        VARCHAR(200) NOT NULL,
  created_at  DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_ei_event (event_id),
  CONSTRAINT fk_ei_event FOREIGN KEY (event_id) REFERENCES health_events(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ── Event RSVPs (inscrições públicas e internas) ──────────────────────────────
CREATE TABLE IF NOT EXISTS event_rsvps (
  id           CHAR(36)     NOT NULL PRIMARY KEY,
  event_id     CHAR(36)     NOT NULL,
  user_id      CHAR(36),
  name         VARCHAR(200) NOT NULL,
  phone        VARCHAR(20),
  guests       INT          NOT NULL DEFAULT 0,
  item_id      CHAR(36),
  observation  TEXT,
  attendance   ENUM('confirmed','present','absent') NOT NULL DEFAULT 'confirmed',
  created_at   DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_rsvp_event (event_id),
  INDEX idx_rsvp_user  (user_id),
  CONSTRAINT fk_rsvp_event FOREIGN KEY (event_id) REFERENCES health_events(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ── Event Item Lists (listas pré-definidas, por usuário, persistidas no back) ─
CREATE TABLE IF NOT EXISTS event_item_lists (
  id         CHAR(36)     NOT NULL PRIMARY KEY,
  user_id    CHAR(36)     NOT NULL,
  name       VARCHAR(200) NOT NULL,
  items      JSON         NOT NULL,
  created_at DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_eil_user (user_id),
  CONSTRAINT fk_eil_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ── Invite Links ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS invite_links (
  id             CHAR(36)     NOT NULL PRIMARY KEY,
  token          VARCHAR(64)  NOT NULL UNIQUE,
  label          VARCHAR(200) NOT NULL DEFAULT 'Link de convite',
  role           ENUM('super-admin','professional','member') NOT NULL DEFAULT 'member',
  max_uses       INT,
  uses_count     INT          NOT NULL DEFAULT 0,
  is_active      TINYINT(1)   NOT NULL DEFAULT 1,
  expires_at     DATETIME     NOT NULL,
  created_by_id  CHAR(36)     NOT NULL,
  created_by_name VARCHAR(150) NOT NULL,
  created_at     DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at     DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  INDEX idx_invite_token  (token),
  INDEX idx_invite_active (is_active),
  CONSTRAINT fk_invite_creator FOREIGN KEY (created_by_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ── Invite Link Uses ──────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS invite_link_uses (
  id          CHAR(36) NOT NULL PRIMARY KEY,
  link_id     CHAR(36) NOT NULL,
  user_id     CHAR(36) NOT NULL,
  user_name   VARCHAR(150) NOT NULL,
  user_email  VARCHAR(200) NOT NULL,
  used_at     DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

  INDEX idx_ilu_link (link_id),
  INDEX idx_ilu_user (user_id),
  CONSTRAINT fk_ilu_link FOREIGN KEY (link_id) REFERENCES invite_links(id) ON DELETE CASCADE,
  CONSTRAINT fk_ilu_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ── Refresh Tokens ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS refresh_tokens (
  id         INT          NOT NULL AUTO_INCREMENT PRIMARY KEY,
  user_id    CHAR(36)     NOT NULL,
  token_hash VARCHAR(255) NOT NULL UNIQUE,
  expires_at DATETIME     NOT NULL,
  created_at DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,

  INDEX idx_rt_user   (user_id),
  INDEX idx_rt_token  (token_hash),
  CONSTRAINT fk_rt_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
`;

// ─── Runner ───────────────────────────────────────────────────────────────────

async function migrate() {
  console.log('\n🎵  Espalhe Melodias — Migration\n');
  console.log(`   Host : ${cfg.host}:${cfg.port}`);
  console.log(`   User : ${cfg.user}`);
  console.log(`   DB   : espalhe_melodias\n`);

  let conn;
  try {
    conn = await mysql.createConnection(cfg);
    console.log('✅  Conectado ao MySQL');

    // Cria o banco se não existir
    await conn.query(CREATE_DB);
    console.log('✅  Banco de dados OK');

    // Roda todas as tabelas
    await conn.query(TABLES);
    console.log('✅  Todas as tabelas criadas / verificadas');

    // Adiciona colunas extras em tabelas existentes via INFORMATION_SCHEMA
    const extraCols = [
      // users
      { table: 'users', column: 'whatsapp', def: 'VARCHAR(20)' },
      { table: 'users', column: 'gender',   def: "ENUM('masculino','feminino','nao_declarado')" },
      // health_events
      { table: 'health_events', column: 'location',      def: 'VARCHAR(300)' },
      { table: 'health_events', column: 'map_link',      def: 'TEXT' },
      { table: 'health_events', column: 'cover_url',     def: 'MEDIUMTEXT' },
      { table: 'health_events', column: 'rsvp_enabled',  def: 'TINYINT(1) NOT NULL DEFAULT 1' },
      { table: 'health_events', column: 'allow_guests',  def: 'TINYINT(1) NOT NULL DEFAULT 0' },
      { table: 'health_events', column: 'item_division', def: 'TINYINT(1) NOT NULL DEFAULT 0' },
      { table: 'event_rsvps',   column: 'attendance',   def: "ENUM('confirmed','present','absent') NOT NULL DEFAULT 'confirmed'" },
    ];
    for (const { table, column, def } of extraCols) {
      const [rows] = await conn.query(
        `SELECT COUNT(*) AS cnt FROM INFORMATION_SCHEMA.COLUMNS
         WHERE TABLE_SCHEMA = 'espalhe_melodias' AND TABLE_NAME = ? AND COLUMN_NAME = ?`,
        [table, column],
      );
      if (rows[0].cnt === 0) {
        await conn.query(`ALTER TABLE ${table} ADD COLUMN ${column} ${def}`);
        console.log(`✅  Coluna ${table}.${column} adicionada`);
      } else {
        console.log(`   Coluna ${table}.${column} já existe — ok`);
      }
    }

    // Garante que cover_url suporte base64 de imagens (MEDIUMTEXT = até 16MB)
    await conn.query('ALTER TABLE health_events MODIFY COLUMN cover_url MEDIUMTEXT');
    console.log('✅  health_events.cover_url → MEDIUMTEXT');

    console.log('\n🎉  Migration concluída com sucesso!\n');
    console.log('   Próximo passo: npm run seed  (para dados iniciais)\n');
  } catch (err) {
    console.error('\n❌  Erro na migration:\n', err);
    process.exit(1);
  } finally {
    if (conn) await conn.end();
  }
}

migrate();
