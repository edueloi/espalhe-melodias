#!/usr/bin/env node
/**
 * SEED_BLOG_EVENTS.js — Popula categorias e dados iniciais de Blog e Eventos
 *
 * Uso:
 *   node SEED_BLOG_EVENTS.js
 */

'use strict';

const path = require('path');
const mysql = require('mysql2/promise');
require('dotenv').config({ path: path.resolve(__dirname, '.env') });

const { v4: uuidv4 } = require('uuid');

const cfg = {
  host: process.env.DB_HOST ?? 'localhost',
  port: parseInt(process.env.DB_PORT ?? '3306', 10),
  user: process.env.DB_USER ?? 'root',
  password: process.env.DB_PASSWORD ?? '',
  database: process.env.DB_NAME ?? 'espalhe_melodias',
};

const newId = () => uuidv4();
const nowISO = () => new Date().toISOString().slice(0, 19).replace('T', ' ');

// ─── Blog Categories ──────────────────────────────────────────────────────────
const BLOG_CATEGORIES = [
  {
    name: 'Saúde Mental',
    slug: 'saude-mental',
    description: 'Dicas e informações sobre saúde mental e bem-estar emocional',
    icon: 'heart',
    color: 'rose',
    order_rank: 1,
  },
  {
    name: 'Meditação',
    slug: 'meditacao',
    description: 'Técnicas e práticas de meditação para iniciantes e avançados',
    icon: 'meditation',
    color: 'teal',
    order_rank: 2,
  },
  {
    name: 'Yoga',
    slug: 'yoga',
    description: 'Asanas, pranayama e filosofia do yoga',
    icon: 'yoga',
    color: 'amber',
    order_rank: 3,
  },
  {
    name: 'Nutrição',
    slug: 'nutricao',
    description: 'Nutrição saudável e receitas nutritivas',
    icon: 'apple',
    color: 'moss',
    order_rank: 4,
  },
  {
    name: 'Bem-estar',
    slug: 'bem-estar',
    description: 'Dicas gerais de bem-estar e qualidade de vida',
    icon: 'star',
    color: 'navy',
    order_rank: 5,
  },
];

// ─── Event Categories ─────────────────────────────────────────────────────────
const EVENT_CATEGORIES = [
  {
    name: 'Workshop',
    slug: 'workshop',
    description: 'Workshops práticos e interativos',
    icon: 'video',
    color: 'clay',
    order_rank: 1,
  },
  {
    name: 'Palestra',
    slug: 'palestra',
    description: 'Palestras e conferências',
    icon: 'speaker',
    color: 'navy',
    order_rank: 2,
  },
  {
    name: 'Grupo de Apoio',
    slug: 'grupo-apoio',
    description: 'Grupos de apoio e suporte comunitário',
    icon: 'users',
    color: 'rose',
    order_rank: 3,
  },
  {
    name: 'Meditação Coletiva',
    slug: 'meditacao-coletiva',
    description: 'Sessões coletivas de meditação',
    icon: 'meditation',
    color: 'teal',
    order_rank: 4,
  },
  {
    name: 'Webinar',
    slug: 'webinar',
    description: 'Sessões online ao vivo',
    icon: 'globe',
    color: 'amber',
    order_rank: 5,
  },
];

// ─── Sample Blog Posts ─────────────────────────────────────────────────────────
const SAMPLE_BLOG_POSTS = [
  {
    title: 'Meditação para Iniciantes: Um Guia Completo',
    slug: 'meditacao-iniciantes-guia',
    excerpt: 'Aprenda como começar sua jornada de meditação com dicas práticas e eficazes.',
    content: `<h2>Introdução à Meditação</h2>
<p>A meditação é uma prática antiga que traz muitos benefícios para a saúde mental e bem-estar geral. Neste guia, vamos explorar os conceitos fundamentais e fornecer passos práticos para começar.</p>
<h3>Passo 1: Escolha um local tranquilo</h3>
<p>Encontre um espaço confortável, sem distrações, onde você possa se sentar por alguns minutos sem ser incomodado.</p>
<h3>Passo 2: Postura correta</h3>
<p>Sente-se em uma posição confortável. Pode ser no chão, em uma almofada, ou em uma cadeira. O importante é manter a coluna reta.</p>
<h3>Benefícios comprovados</h3>
<p>Estudos científicos mostram que a meditação regular reduz o estresse, melhora a concentração e promove bem-estar emocional.</p>`,
    category: 'Meditação',
    imageUrl: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=800',
    readTime: '8 min',
    status: 'published',
    featured: true,
    seoTitle: 'Meditação para Iniciantes: Guia Completo - Espalhe Melodias',
    seoDescription: 'Aprenda meditação do zero com nosso guia prático e acessível. Inclui técnicas, benefícios e dicas.',
    seoKeywords: 'meditação, iniciantes, bem-estar, mindfulness, yoga',
    ogImageUrl: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=1200',
  },
  {
    title: 'Yoga: Benefícios Científicos Comprovados',
    slug: 'yoga-beneficios-cientificos',
    excerpt: 'Descubra o que a ciência diz sobre os benefícios do yoga para corpo e mente.',
    content: `<h2>Benefícios Científicos do Yoga</h2>
<p>Estudos recentes realizados por universidades de renome mostram que a prática regular de yoga oferece benefícios significativos para a saúde física e mental.</p>
<h3>Redução do estresse</h3>
<p>A meditação e respiração controladaaju reduzem os níveis de cortisol, o hormônio do estresse.</p>
<h3>Melhora da flexibilidade</h3>
<p>As posturas de yoga aumentam a flexibilidade muscular e articular.</p>
<h3>Fortalecimento muscular</h3>
<p>Muitas asanas trabalham grupos musculares importantes, especialmente o core.</p>`,
    category: 'Yoga',
    imageUrl: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=800',
    readTime: '6 min',
    status: 'published',
    featured: false,
    seoTitle: 'Yoga: Benefícios Científicos Comprovados',
    seoDescription: 'Conheça os benefícios comprovados pela ciência da prática regular de yoga.',
    seoKeywords: 'yoga, benefícios, saúde, ciência, bem-estar',
  },
  {
    title: 'Nutrição e Saúde Mental: A Conexão Oculta',
    slug: 'nutricao-saude-mental-conexao',
    excerpt: 'Como a alimentação influencia sua saúde mental e bem-estar emocional.',
    content: `<h2>A Relação entre Nutrição e Saúde Mental</h2>
<p>Cada vez mais pesquisas mostram uma conexão profunda entre o que comemos e como nos sentimos.</p>
<h3>Nutrientes essenciais</h3>
<p>Ômega-3, vitamina B, magnésio e outros nutrientes são fundamentais para a função cerebral adequada.</p>
<h3>Alimentos para melhorar o humor</h3>
<p>Alimentos ricos em triptofano como banana, abóbora e sementes de abóbora podem ajudar a aumentar a serotonina.</p>`,
    category: 'Nutrição',
    imageUrl: 'https://images.unsplash.com/photo-1495521821757-a1efb6729352?w=800',
    readTime: '7 min',
    status: 'published',
    featured: true,
    seoTitle: 'Nutrição e Saúde Mental: Como a Alimentação Afeta Seu Bem-estar',
    seoDescription: 'Descubra a conexão entre nutrição e saúde mental.',
    seoKeywords: 'nutrição, saúde mental, alimentação saudável',
  },
];

// ─── Sample Events ────────────────────────────────────────────────────────────
const SAMPLE_EVENTS = [
  {
    title: 'Workshop: Meditação Mindfulness Prática',
    slug: 'workshop-meditacao-mindfulness',
    description: 'Um workshop prático sobre mindfulness e suas aplicações no dia a dia. Aprenda técnicas que você pode usar imediatamente.',
    date: '2024-07-20',
    time: '10:00',
    location: 'São Paulo, SP',
    category: 'Workshop',
    eventCapacity: 30,
    status: 'upcoming',
    seoDescription: 'Workshop prático de meditação mindfulness em São Paulo',
    registrationDeadline: '2024-07-19T23:59:59',
  },
  {
    title: 'Palestra: Saúde Mental na Era Digital',
    slug: 'palestra-saude-digital',
    description: 'Uma palestra sobre os desafios e oportunidades para a saúde mental na era digital. Como proteger sua saúde mental online?',
    date: '2024-07-25',
    time: '19:00',
    location: 'Rio de Janeiro, RJ',
    category: 'Palestra',
    eventCapacity: 100,
    status: 'upcoming',
    seoDescription: 'Palestra sobre saúde mental e o impacto da era digital',
    registrationDeadline: '2024-07-24T23:59:59',
  },
  {
    title: 'Grupo de Apoio: Ansiedade e Controle Emocional',
    slug: 'grupo-apoio-ansiedade',
    description: 'Grupo de apoio aberto para discutir ansiedade, técnicas de controle emocional e partilhar experiências.',
    date: '2024-08-01',
    time: '18:30',
    location: 'Virtual (Zoom)',
    category: 'Grupo de Apoio',
    eventCapacity: 20,
    status: 'upcoming',
    seoDescription: 'Grupo de apoio para ansiedade e controle emocional',
    registrationDeadline: '2024-07-31T23:59:59',
  },
  {
    title: 'Meditação Coletiva Matinal',
    slug: 'meditacao-coletiva-matinal',
    description: 'Sessão de meditação coletiva para começar o dia com calma e foco. Todos os níveis são bem-vindos.',
    date: '2024-07-22',
    time: '07:00',
    location: 'Parque do Ibirapuera, São Paulo',
    category: 'Meditação Coletiva',
    eventCapacity: 50,
    status: 'upcoming',
    seoDescription: 'Meditação coletiva matinal no Parque do Ibirapuera',
    registrationDeadline: '2024-07-21T23:59:59',
  },
];

// ─── Seed Functions ───────────────────────────────────────────────────────────

async function seedBlogCategories(conn) {
  console.log('\n📚  Seedando Blog Categories...');
  for (const cat of BLOG_CATEGORIES) {
    const id = newId();
    try {
      await conn.query(
        `INSERT INTO blog_categories
         (id, name, slug, description, icon, color, order_rank)
         VALUES (?, ?, ?, ?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE description = VALUES(description)`,
        [id, cat.name, cat.slug, cat.description, cat.icon, cat.color, cat.order_rank],
      );
      console.log(`   ✅ ${cat.name}`);
    } catch (err) {
      console.error(`   ❌ Erro ao criar ${cat.name}:`, err.message);
    }
  }
}

async function seedEventCategories(conn) {
  console.log('\n📅  Seedando Event Categories...');
  for (const cat of EVENT_CATEGORIES) {
    const id = newId();
    try {
      await conn.query(
        `INSERT INTO event_categories
         (id, name, slug, description, icon, color, order_rank)
         VALUES (?, ?, ?, ?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE description = VALUES(description)`,
        [id, cat.name, cat.slug, cat.description, cat.icon, cat.color, cat.order_rank],
      );
      console.log(`   ✅ ${cat.name}`);
    } catch (err) {
      console.error(`   ❌ Erro ao criar ${cat.name}:`, err.message);
    }
  }
}

async function seedBlogPosts(conn, adminId, adminName) {
  console.log('\n📝  Seedando Blog Posts...');

  for (const post of SAMPLE_BLOG_POSTS) {
    // Obter category_id
    const [catResult] = await conn.query('SELECT id FROM blog_categories WHERE name = ?', [post.category]);
    const categoryId = catResult[0]?.id || null;

    const id = newId();
    const now = nowISO();
    const publishedAt = post.status === 'published' ? now : null;

    try {
      await conn.query(
        `INSERT INTO blog_posts
         (id, title, slug, excerpt, content, category_id, category, image_url,
          author_id, author_name, author_avatar, read_time, liked_by, status,
          seo_title, seo_description, seo_keywords, og_image_url,
          featured, views_count, post_date, published_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, '[]', ?, ?, ?, ?, ?, ?, 0, ?, ?, ?)
         ON DUPLICATE KEY UPDATE updated_at = VALUES(updated_at)`,
        [
          id,
          post.title,
          post.slug,
          post.excerpt,
          post.content,
          categoryId,
          post.category,
          post.imageUrl,
          adminId,
          adminName,
          null,
          post.readTime,
          post.status,
          post.seoTitle,
          post.seoDescription,
          post.seoKeywords,
          post.ogImageUrl,
          post.featured ? 1 : 0,
          now,
          publishedAt,
          now,
        ],
      );
      console.log(`   ✅ ${post.title}`);
    } catch (err) {
      console.error(`   ❌ Erro ao criar ${post.title}:`, err.message);
    }
  }
}

async function seedEvents(conn, adminId, adminName) {
  console.log('\n🎉  Seedando Events...');

  for (const evt of SAMPLE_EVENTS) {
    // Obter category_id
    const [catResult] = await conn.query('SELECT id FROM event_categories WHERE name = ?', [evt.category]);
    const categoryId = catResult[0]?.id || null;

    const id = newId();
    const now = nowISO();
    const generatedSlug = evt.slug || `${evt.title.toLowerCase().replace(/\s+/g, '-')}-${id.substring(0, 8)}`;
    const isPast = new Date(evt.date) < new Date();
    const status = isPast ? 'past' : 'upcoming';

    try {
      await conn.query(
        `INSERT INTO health_events
         (id, title, slug, instructor_id, instructor_name, instructor_avatar,
          event_date, event_time, description, category_id, category,
          status, status_enum, enrolled_user_ids, recording_url,
          location, cover_url, thumbnail_url,
          rsvp_enabled, allow_guests, item_division,
          event_capacity, seo_description, registration_deadline,
          created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, '[]', ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE updated_at = VALUES(updated_at)`,
        [
          id,
          evt.title,
          generatedSlug,
          adminId,
          adminName,
          null,
          evt.date,
          evt.time,
          evt.description,
          categoryId,
          evt.category,
          status,
          'upcoming',
          null,
          evt.location,
          null,
          null,
          1, // rsvp_enabled
          0, // allow_guests
          0, // item_division
          evt.eventCapacity,
          evt.seoDescription,
          evt.registrationDeadline,
          now,
          now,
        ],
      );
      console.log(`   ✅ ${evt.title}`);
    } catch (err) {
      console.error(`   ❌ Erro ao criar ${evt.title}:`, err.message);
    }
  }
}

// ─── Main Runner ──────────────────────────────────────────────────────────────

async function run() {
  console.log('\n🎵  Espalhe Melodias — Seed (Blog & Events)\n');
  console.log(`   Host : ${cfg.host}:${cfg.port}`);
  console.log(`   User : ${cfg.user}`);
  console.log(`   DB   : ${cfg.database}\n`);

  let conn;
  try {
    conn = await mysql.createConnection(cfg);
    console.log('✅  Conectado ao MySQL\n');

    // Seed Categories
    await seedBlogCategories(conn);
    await seedEventCategories(conn);

    // Obter admin (primeiro super-admin)
    const [adminResult] = await conn.query('SELECT id, name FROM users WHERE role = ? LIMIT 1', [
      'super-admin',
    ]);
    const adminId = adminResult[0]?.id || newId();
    const adminName = adminResult[0]?.name || 'Admin';

    // Seed Posts e Events
    await seedBlogPosts(conn, adminId, adminName);
    await seedEvents(conn, adminId, adminName);

    console.log('\n🎉  Seed concluído com sucesso!\n');
  } catch (err) {
    console.error('\n❌  Erro no seed:\n', err);
    process.exit(1);
  } finally {
    if (conn) await conn.end();
  }
}

run();
