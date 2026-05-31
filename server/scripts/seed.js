#!/usr/bin/env node
/**
 * seed.js — popula o banco com dados iniciais.
 * Uso: node scripts/seed.js
 */
'use strict';

const path   = require('path');
const mysql  = require('mysql2/promise');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

const pool = mysql.createPool({
  host:            process.env.DB_HOST     ?? 'localhost',
  port:            parseInt(process.env.DB_PORT ?? '3306', 10),
  user:            process.env.DB_USER     ?? 'root',
  password:        process.env.DB_PASSWORD ?? '',
  database:        process.env.DB_NAME     ?? 'espalhe_melodias',
  connectionLimit: 5,
});

const newId = () => uuidv4();
const now   = () => new Date().toISOString().slice(0, 19).replace('T', ' ');

// ─── Usuários ─────────────────────────────────────────────────────────────────

const USERS = [
  { name: 'Karen Gomes',        email: 'karen.l.s.gomes@gmail.com',  password: 'Bibia.0110',   role: 'super-admin',  status: 'approved', specialty: 'Administração',              crp: null },
  { name: 'Dra. Eliana Costa',  email: 'dra.eliana@melodias.com.br', password: 'eliana2026',   role: 'professional', status: 'approved', specialty: 'Psicóloga Clínica',          crp: 'CRP 06/12345' },
  { name: 'Dr. Marcos Pereira', email: 'dr.marcos@melodias.com.br',  password: 'marcos2026',   role: 'professional', status: 'approved', specialty: 'Psicólogo Comportamental',   crp: 'CRP 06/54321' },
  { name: 'Gabriel Souza',      email: 'gabriel.souza@gmail.com',    password: 'gabriel2026',  role: 'member',       status: 'approved', specialty: null, crp: null },
  { name: 'Mariana Duarte',     email: 'mariana.duarte@outlook.com', password: 'mariana2026',  role: 'member',       status: 'pending',  specialty: null, crp: null },
];

const DEFAULT_FILTERS = {
  forum:     { defaultCategory: 'Todos', defaultSort: 'recent' },
  materials: { defaultCategory: 'Todos', defaultType: 'Todos', defaultView: 'grid' },
  events:    { defaultStatus: 'all' },
  directory: { defaultSpecialty: 'Todos', defaultView: 'grid' },
};

async function seedUsers() {
  console.log('\n👤  Criando usuários...');
  const ids = {};

  for (const u of USERS) {
    const [rows] = await pool.query('SELECT id FROM users WHERE email = ?', [u.email]);
    if (rows.length > 0) {
      ids[u.email] = rows[0].id;
      console.log(`   ⚠  ${u.email} já existe (id: ${rows[0].id})`);
      continue;
    }

    const hash = await bcrypt.hash(u.password, 12);
    const id   = newId();
    const n    = now();
    ids[u.email] = id;

    await pool.query(
      `INSERT INTO users (id, name, email, password_hash, role, approval_status, specialty, crp, avatar, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, NULL, ?, ?)`,
      [id, u.name, u.email, hash, u.role, u.status, u.specialty ?? null, u.crp ?? null, n, n],
    );

    // Preferências padrão
    await pool.query(
      `INSERT INTO user_preferences
       (id, user_id, theme, accent_color, font_size, layout_density, language, sidebar_collapsed,
        notif_forum_reply, notif_event_reminder, notif_help_update, notif_new_material, notif_push_enabled,
        dash_show_welcome, dash_show_quote, dash_show_stats, dash_default_view,
        filter_forum, filter_materials, filter_events, filter_directory,
        bookmarked_materials, bookmarked_topics, enrolled_events, created_at, updated_at)
       VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
      [
        newId(), id, 'light', 'clay', 'md', 'comfortable', 'pt-BR', 0,
        1, 1, 1, 0, 0,
        1, 1, 1, 'grid',
        JSON.stringify(DEFAULT_FILTERS.forum),
        JSON.stringify(DEFAULT_FILTERS.materials),
        JSON.stringify(DEFAULT_FILTERS.events),
        JSON.stringify(DEFAULT_FILTERS.directory),
        '[]', '[]', '[]', n, n,
      ],
    );

    console.log(`   ✅  ${u.email} (${u.role})`);
  }

  return ids;
}

// ─── Profissionais ────────────────────────────────────────────────────────────

async function seedProfessionals(ids) {
  console.log('\n🩺  Criando perfis profissionais...');

  const profs = [
    {
      userId: ids['dra.eliana@melodias.com.br'],
      crp: 'CRP 06/12345',
      specialties: ['Ansiedade', 'Depressão', 'Burnout'],
      bio: 'Psicóloga clínica com 10 anos de experiência, especializada em transtornos de ansiedade e depressão.',
      price: 150.00, rating: 4.9, reviews: 48,
      whatsapp: '(11) 99999-0001',
      services: ['Terapia Individual', 'Acompanhamento Online'],
      schedule: [{ day: 'Segunda-feira', hours: '09h-18h' }, { day: 'Quarta-feira', hours: '09h-18h' }],
      location: 'São Paulo, SP', color: '#5a6242', languages: ['Português', 'Inglês'],
    },
    {
      userId: ids['dr.marcos@melodias.com.br'],
      crp: 'CRP 06/54321',
      specialties: ['TCC', 'Fobias', 'TOC'],
      bio: 'Especialista em Terapia Cognitivo-Comportamental com foco em fobias e transtornos obsessivos.',
      price: 130.00, rating: 4.7, reviews: 31,
      whatsapp: '(11) 99999-0002',
      services: ['Terapia Individual', 'Terapia Online', 'Grupos'],
      schedule: [{ day: 'Terça-feira', hours: '10h-19h' }, { day: 'Quinta-feira', hours: '10h-19h' }],
      location: 'Campinas, SP', color: '#182638', languages: ['Português'],
    },
  ];

  for (const p of profs) {
    if (!p.userId) { console.log('   ⚠  userId não encontrado, pulando.'); continue; }
    const [rows] = await pool.query('SELECT id FROM professional_profiles WHERE user_id = ?', [p.userId]);
    if (rows.length > 0) { console.log(`   ⚠  Prof userId=${p.userId} já existe.`); continue; }

    const n = now();
    await pool.query(
      `INSERT INTO professional_profiles
       (id, user_id, crp, specialties, bio, price_per_session, rating, reviews_count,
        contact_whatsapp, services, schedule, location, accent_color, languages, created_at, updated_at)
       VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
      [
        newId(), p.userId, p.crp,
        JSON.stringify(p.specialties), p.bio, p.price, p.rating, p.reviews,
        p.whatsapp, JSON.stringify(p.services), JSON.stringify(p.schedule),
        p.location, p.color, JSON.stringify(p.languages), n, n,
      ],
    );
    console.log(`   ✅  ${p.crp}`);
  }
}

// ─── Fórum ────────────────────────────────────────────────────────────────────

async function seedForum(ids) {
  console.log('\n💬  Criando tópicos do fórum...');
  const [rows] = await pool.query('SELECT COUNT(*) AS c FROM forum_topics');
  if (rows[0].c > 0) { console.log('   ⚠  Tópicos já existem.'); return; }

  const gabrielId = ids['gabriel.souza@gmail.com'];
  const elianaId  = ids['dra.eliana@melodias.com.br'];
  const topicId   = newId();
  const n         = now();

  await pool.query(
    `INSERT INTO forum_topics
     (id, title, category, author_id, author_name, author_role, content, liked_by, created_at, updated_at)
     VALUES (?,?,?,?,?,?,?,'[]',?,?)`,
    [topicId, 'Pensamentos acelerados à noite — como vocês lidam?', 'Ansiedade',
     gabrielId, 'Gabriel Souza', 'member',
     'Ultimamente tenho sentido muito os pensamentos acelerando na hora de dormir. Alguém mais passa por isso? O que tem ajudado?',
     n, n],
  );

  await pool.query(
    `INSERT INTO forum_replies
     (id, topic_id, author_id, author_name, author_role, content, is_expert_reply, liked_by, created_at)
     VALUES (?,?,?,?,?,?,1,'[]',?)`,
    [newId(), topicId, elianaId, 'Dra. Eliana Costa', 'professional',
     'Técnicas de respiração diafragmática e journaling antes de dormir costumam ajudar muito. Tente escrever seus pensamentos em papel para "esvaziar" a mente.', n],
  );
  console.log('   ✅  1 tópico com resposta expert');
}

// ─── Materiais ────────────────────────────────────────────────────────────────

async function seedMaterials(ids) {
  console.log('\n📚  Criando materiais...');
  const [rows] = await pool.query('SELECT COUNT(*) AS c FROM support_materials');
  if (rows[0].c > 0) { console.log('   ⚠  Materiais já existem.'); return; }

  const elianaId = ids['dra.eliana@melodias.com.br'];
  const mats = [
    { title: 'Guia de Crise de Pânico', category: 'Ansiedade', type: 'Guia de Exercícios', desc: 'Técnicas de respiração para momentos de crise.', restricted: 0 },
    { title: 'Meditação Mindfulness — 10min', category: 'Meditação', type: 'Áudio', desc: 'Meditação guiada para iniciantes.', restricted: 1 },
    { title: 'Planner de Autocuidado Diário', category: 'Autocuidado', type: 'PDF', desc: 'Planejador para criar uma rotina de autocuidado.', restricted: 0 },
  ];

  for (const m of mats) {
    const n = now();
    await pool.query(
      `INSERT INTO support_materials
       (id, title, category, type, description, download_url, author_id, author_name, restricted_to_members, date_added, updated_at)
       VALUES (?,?,?,?,?,?,?,?,?,?,?)`,
      [newId(), m.title, m.category, m.type, m.desc, '#', elianaId, 'Dra. Eliana Costa', m.restricted, n, n],
    );
    console.log(`   ✅  ${m.title}`);
  }
}

// ─── Eventos ──────────────────────────────────────────────────────────────────

async function seedEvents(ids) {
  console.log('\n🗓  Criando eventos...');
  const [rows] = await pool.query('SELECT COUNT(*) AS c FROM health_events');
  if (rows[0].c > 0) { console.log('   ⚠  Eventos já existem.'); return; }

  const elianaId = ids['dra.eliana@melodias.com.br'];
  const events = [
    { title: 'Grupo de Apoio — Ansiedade',     date: '2026-07-10', time: '19:00', category: 'Grupo de Apoio',     status: 'upcoming', recording: null },
    { title: 'Workshop: Técnicas de Respiração',date: '2026-07-20', time: '10:00', category: 'Workshop',           status: 'upcoming', recording: null },
    { title: 'Palestra: Burnout no Trabalho',   date: '2026-03-15', time: '18:00', category: 'Palestra Vivencial', status: 'past',     recording: 'https://youtube.com/watch?v=exemplo' },
  ];

  for (const e of events) {
    const n = now();
    await pool.query(
      `INSERT INTO health_events
       (id, title, instructor_id, instructor_name, event_date, event_time, description, category, status, enrolled_user_ids, recording_url, created_at, updated_at)
       VALUES (?,?,?,?,?,?,?,?,?,'[]',?,?,?)`,
      [newId(), e.title, elianaId, 'Dra. Eliana Costa', e.date, e.time, e.title, e.category, e.status, e.recording, n, n],
    );
    console.log(`   ✅  ${e.title}`);
  }
}

// ─── Sugestões ────────────────────────────────────────────────────────────────

async function seedSuggestions(ids) {
  console.log('\n💡  Criando sugestões...');
  const [rows] = await pool.query('SELECT COUNT(*) AS c FROM suggestion_ideas');
  if (rows[0].c > 0) { console.log('   ⚠  Sugestões já existem.'); return; }

  const gabrielId = ids['gabriel.souza@gmail.com'];
  await pool.query(
    `INSERT INTO suggestion_ideas (id, author_id, author_name, content, liked_by, status, created_at)
     VALUES (?,?,?,?,'[]','open',?)`,
    [newId(), gabrielId, 'Gabriel Souza', 'Seria incrível ter um chat em tempo real com os profissionais!', now()],
  );
  console.log('   ✅  1 sugestão criada');
}

// ─── Blogs ────────────────────────────────────────────────────────────────────

async function seedBlogs(ids) {
  console.log('\n✍️   Criando posts do blog...');
  const [rows] = await pool.query('SELECT COUNT(*) AS c FROM blog_posts');
  if (rows[0].c > 0) { console.log('   ⚠  Posts já existem.'); return; }

  const elianaId = ids['dra.eliana@melodias.com.br'];
  const posts = [
    {
      title: 'Depressão x Tristeza: entenda a diferença',
      excerpt: 'Nem toda tristeza é depressão — mas como saber a diferença?',
      content: '<p>A tristeza é uma emoção natural e passageira. A depressão é um transtorno que persiste por semanas ou meses, impactando sono, apetite e capacidade de sentir prazer.</p><p>Principais diferenças:<br>• Tristeza: reativa, passa em dias<br>• Depressão: persistente, mais de 2 semanas<br>• Depressão: afeta funções básicas (sono, alimentação, concentração)</p>',
      category: 'Saúde Mental', readTime: '5 min',
    },
    {
      title: 'O que é detox de dopamina e como praticar',
      excerpt: 'Reduzir estímulos digitais pode transformar sua clareza mental.',
      content: '<p>O detox de dopamina propõe reduzir comportamentos que geram recompensas rápidas, como redes sociais e streaming, para restaurar a sensibilidade natural do sistema de recompensa.</p><p>Como praticar:<br>• 1 dia por semana sem redes sociais<br>• Leitura física no lugar do celular<br>• Atividades manuais e criativas</p>',
      category: 'Bem-estar', readTime: '7 min',
    },
  ];

  for (const p of posts) {
    const n = now();
    await pool.query(
      `INSERT INTO blog_posts
       (id, title, excerpt, content, category, author_id, author_name, read_time, liked_by, published, post_date, updated_at)
       VALUES (?,?,?,?,?,?,?,?,'[]',1,?,?)`,
      [newId(), p.title, p.excerpt, p.content, p.category, elianaId, 'Dra. Eliana Costa', p.readTime, n, n],
    );
    console.log(`   ✅  ${p.title}`);
  }
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  console.log('\n🎵  Espalhe Melodias — Seed\n');
  try {
    const ids = await seedUsers();
    await seedProfessionals(ids);
    await seedForum(ids);
    await seedMaterials(ids);
    await seedEvents(ids);
    await seedSuggestions(ids);
    await seedBlogs(ids);
    console.log('\n🎉  Seed concluído com sucesso!\n');
    console.log('   Admin: karen.l.s.gomes@gmail.com / Bibia.0110\n');
  } catch (err) {
    console.error('\n❌  Erro no seed:', err.message);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

main();
