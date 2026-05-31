/**
 * seed.ts — popula o banco com dados iniciais espelhando o frontend.
 *
 * Uso: npm run seed
 */
import dotenv from 'dotenv';
import path from 'path';
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

import bcrypt from 'bcryptjs';
import { pool, execute } from '../config/db';
import { DEFAULT_PREFERENCES } from '../types/domain';

const newId = () => require('uuid').v4() as string;
const now   = () => new Date().toISOString().slice(0, 19).replace('T', ' ');

// ─── Usuários ─────────────────────────────────────────────────────────────────

const users = [
  // Admin real — credenciais definitivas de produção
  { id: newId(), name: 'Karen Gomes', email: 'karen.l.s.gomes@gmail.com', password: 'Bibia.0110', role: 'super-admin', approval_status: 'approved', specialty: 'Administração', crp: null, avatar: null },
  // Profissionais de exemplo
  { id: newId(), name: 'Dra. Eliana Costa',  email: 'dra.eliana@melodias.com.br', password: 'eliana2026',  role: 'professional', approval_status: 'approved', specialty: 'Psicóloga Clínica',          crp: 'CRP 06/12345', avatar: null },
  { id: newId(), name: 'Dr. Marcos Pereira', email: 'dr.marcos@melodias.com.br',  password: 'marcos2026',  role: 'professional', approval_status: 'approved', specialty: 'Psicólogo Comportamental',   crp: 'CRP 06/54321', avatar: null },
  // Membros de exemplo
  { id: newId(), name: 'Gabriel Souza',  email: 'gabriel.souza@gmail.com',    password: 'gabriel2026', role: 'member', approval_status: 'approved', specialty: null, crp: null, avatar: null },
  { id: newId(), name: 'Mariana Duarte', email: 'mariana.duarte@outlook.com', password: 'mariana2026', role: 'member', approval_status: 'pending',  specialty: null, crp: null, avatar: null },
];

async function seedUsers() {
  console.log('\n👤  Criando usuários...');
  for (const u of users) {
    const existing = (await pool.execute('SELECT id FROM users WHERE email = ?', [u.email]) as [unknown[], unknown])[0] as unknown[];
    if ((existing as {id:string}[]).length > 0) {
      console.log(`   ⚠  ${u.email} já existe, pulando.`);
      continue;
    }

    const hash = await bcrypt.hash(u.password, 12);
    const n    = now();

    await execute(
      `INSERT INTO users (id, name, email, password_hash, role, approval_status, specialty, crp, avatar, created_at, updated_at)
       VALUES (?,?,?,?,?,?,?,?,?,?,?)`,
      [u.id, u.name, u.email, hash, u.role, u.approval_status, u.specialty ?? null, u.crp ?? null, u.avatar ?? null, n, n],
    );

    // Preferências padrão
    const d = DEFAULT_PREFERENCES;
    await execute(
      `INSERT INTO user_preferences
       (id, user_id, theme, accent_color, font_size, layout_density, language, sidebar_collapsed,
        notif_forum_reply, notif_event_reminder, notif_help_update, notif_new_material, notif_push_enabled,
        dash_show_welcome, dash_show_quote, dash_show_stats, dash_default_view,
        filter_forum, filter_materials, filter_events, filter_directory,
        bookmarked_materials, bookmarked_topics, enrolled_events, created_at, updated_at)
       VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
      [
        newId(), u.id, d.theme, d.accentColor, d.fontSize, d.layoutDensity, d.language, 0,
        1,1,1,0,0, 1,1,1,'grid',
        JSON.stringify(d.filters.forum), JSON.stringify(d.filters.materials),
        JSON.stringify(d.filters.events), JSON.stringify(d.filters.directory),
        '[]','[]','[]', n, n,
      ],
    );

    console.log(`   ✅  ${u.email} (${u.role})`);
  }
}

// ─── Profissionais ────────────────────────────────────────────────────────────

async function seedProfessionals() {
  console.log('\n🩺  Criando perfis profissionais...');

  const eliana = users.find(u => u.email === 'dra.eliana@melodias.com.br')!;
  const marcos = users.find(u => u.email === 'dr.marcos@melodias.com.br')!;

  const profs = [
    {
      id: newId(), user_id: eliana.id, crp: 'CRP 06/12345',
      specialties: ['Ansiedade', 'Depressão', 'Burnout'],
      bio: 'Psicóloga clínica com 10 anos de experiência, especializada em transtornos de ansiedade e depressão.',
      price_per_session: 150.00, rating: 4.9, reviews_count: 48,
      contact_whatsapp: '(11) 99999-0001',
      services: ['Terapia Individual', 'Acompanhamento Online'],
      schedule: [{ day: 'Segunda-feira', hours: '09h-18h' }, { day: 'Quarta-feira', hours: '09h-18h' }],
      location: 'São Paulo, SP',
      accent_color: '#5a6242',
      languages: ['Português', 'Inglês'],
    },
    {
      id: newId(), user_id: marcos.id, crp: 'CRP 06/54321',
      specialties: ['TCC', 'Fobias', 'TOC'],
      bio: 'Especialista em Terapia Cognitivo-Comportamental com foco em fobias e transtornos obsessivos.',
      price_per_session: 130.00, rating: 4.7, reviews_count: 31,
      contact_whatsapp: '(11) 99999-0002',
      services: ['Terapia Individual', 'Terapia Online', 'Grupos'],
      schedule: [{ day: 'Terça-feira', hours: '10h-19h' }, { day: 'Quinta-feira', hours: '10h-19h' }],
      location: 'Campinas, SP',
      accent_color: '#182638',
      languages: ['Português'],
    },
  ];

  for (const p of profs) {
    const existing = (await pool.execute('SELECT id FROM professional_profiles WHERE user_id = ?', [p.user_id]) as [unknown[], unknown])[0] as unknown[];
    if ((existing as {id:string}[]).length > 0) { console.log(`   ⚠  Prof userId=${p.user_id} já existe, pulando.`); continue; }

    const n = now();
    await execute(
      `INSERT INTO professional_profiles
       (id, user_id, crp, specialties, bio, price_per_session, rating, reviews_count,
        contact_whatsapp, services, schedule, location, accent_color, languages, created_at, updated_at)
       VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
      [
        p.id, p.user_id, p.crp, JSON.stringify(p.specialties), p.bio,
        p.price_per_session, p.rating, p.reviews_count, p.contact_whatsapp,
        JSON.stringify(p.services), JSON.stringify(p.schedule),
        p.location, p.accent_color, JSON.stringify(p.languages), n, n,
      ],
    );
    console.log(`   ✅  Perfil de ${p.crp}`);
  }
}

// ─── Forum ────────────────────────────────────────────────────────────────────

async function seedForum() {
  console.log('\n💬  Criando tópicos do fórum...');

  const gabriel = users.find(u => u.email === 'gabriel.souza@gmail.com')!;
  const eliana  = users.find(u => u.email === 'dra.eliana@melodias.com.br')!;

  const topicId = newId();
  const n = now();

  const existing = (await pool.execute('SELECT COUNT(*) AS c FROM forum_topics') as [unknown[], unknown])[0] as {c:number}[];
  if (existing[0].c > 0) { console.log('   ⚠  Tópicos já existem, pulando.'); return; }

  await execute(
    `INSERT INTO forum_topics
     (id, title, category, author_id, author_name, author_role, content, liked_by, created_at, updated_at)
     VALUES (?,?,?,?,?,?,?,'[]',?,?)`,
    [
      topicId,
      'Pensamentos acelerados à noite — como vocês lidam?',
      'Ansiedade',
      gabriel.id, 'Gabriel Souza', 'member',
      'Ultimamente tenho sentido muito os pensamentos acelerando na hora de dormir. Alguém mais passa por isso? O que tem ajudado?',
      n, n,
    ],
  );

  await execute(
    `INSERT INTO forum_replies
     (id, topic_id, author_id, author_name, author_role, content, is_expert_reply, liked_by, created_at)
     VALUES (?,?,?,?,?,?,1,'[]',?)`,
    [
      newId(), topicId, eliana.id, 'Dra. Eliana Costa', 'professional',
      'Ótima pergunta! Técnicas de respiração diafragmática e journaling antes de dormir costumam ajudar muito. Tente escrever seus pensamentos em papel para "esvaziar" a mente.',
      n,
    ],
  );

  console.log('   ✅  Tópico criado com resposta de expert.');
}

// ─── Materiais ────────────────────────────────────────────────────────────────

async function seedMaterials() {
  console.log('\n📚  Criando materiais de apoio...');

  const eliana = users.find(u => u.email === 'dra.eliana@melodias.com.br')!;
  const existing = (await pool.execute('SELECT COUNT(*) AS c FROM support_materials') as [unknown[], unknown])[0] as {c:number}[];
  if (existing[0].c > 0) { console.log('   ⚠  Materiais já existem, pulando.'); return; }

  const mats = [
    { title: 'Guia de Crise de Pânico', category: 'Ansiedade', type: 'Guia de Exercícios', description: 'Técnicas de respiração para momentos de crise.', downloadUrl: '#', restricted: 0 },
    { title: 'Meditação Mindfulness — 10min', category: 'Meditação', type: 'Áudio', description: 'Meditação guiada para iniciantes.', downloadUrl: '#', restricted: 1 },
    { title: 'Planner de Autocuidado Diário', category: 'Autocuidado', type: 'PDF', description: 'Planejador para criar uma rotina de autocuidado.', downloadUrl: '#', restricted: 0 },
  ];

  for (const m of mats) {
    const n = now();
    await execute(
      `INSERT INTO support_materials
       (id, title, category, type, description, download_url, author_id, author_name, restricted_to_members, date_added, updated_at)
       VALUES (?,?,?,?,?,?,?,?,?,?,?)`,
      [newId(), m.title, m.category, m.type, m.description, m.downloadUrl, eliana.id, 'Dra. Eliana Costa', m.restricted, n, n],
    );
    console.log(`   ✅  ${m.title}`);
  }
}

// ─── Eventos ──────────────────────────────────────────────────────────────────

async function seedEvents() {
  console.log('\n🗓  Criando eventos...');

  const eliana = users.find(u => u.email === 'dra.eliana@melodias.com.br')!;
  const existing = (await pool.execute('SELECT COUNT(*) AS c FROM health_events') as [unknown[], unknown])[0] as {c:number}[];
  if (existing[0].c > 0) { console.log('   ⚠  Eventos já existem, pulando.'); return; }

  const events = [
    { title: 'Grupo de Apoio — Ansiedade', date: '2026-07-10', time: '19:00', category: 'Grupo de Apoio', status: 'upcoming', description: 'Encontro semanal para compartilhar experiências sobre ansiedade.' },
    { title: 'Workshop: Técnicas de Respiração', date: '2026-07-20', time: '10:00', category: 'Workshop', status: 'upcoming', description: 'Aprenda técnicas de respiração para momentos de estresse.' },
    { title: 'Palestra: Burnout no Trabalho', date: '2026-03-15', time: '18:00', category: 'Palestra Vivencial', status: 'past', description: 'Palestra sobre identificar e prevenir o burnout profissional.', recording: 'https://youtube.com/watch?v=exemplo' },
  ];

  for (const e of events) {
    const n = now();
    await execute(
      `INSERT INTO health_events
       (id, title, instructor_id, instructor_name, event_date, event_time, description, category, status, enrolled_user_ids, recording_url, created_at, updated_at)
       VALUES (?,?,?,?,?,?,?,?,?,'[]',?,?,?)`,
      [newId(), e.title, eliana.id, 'Dra. Eliana Costa', e.date, e.time, e.description, e.category, e.status, (e as {recording?: string}).recording ?? null, n, n],
    );
    console.log(`   ✅  ${e.title}`);
  }
}

// ─── Sugestões ────────────────────────────────────────────────────────────────

async function seedSuggestions() {
  console.log('\n💡  Criando sugestões...');

  const gabriel = users.find(u => u.email === 'gabriel.souza@gmail.com')!;
  const existing = (await pool.execute('SELECT COUNT(*) AS c FROM suggestion_ideas') as [unknown[], unknown])[0] as {c:number}[];
  if (existing[0].c > 0) { console.log('   ⚠  Sugestões já existem, pulando.'); return; }

  await execute(
    `INSERT INTO suggestion_ideas (id, author_id, author_name, content, liked_by, status, created_at)
     VALUES (?,?,?,?,'[]','open',?)`,
    [newId(), gabriel.id, 'Gabriel Souza', 'Seria incrível ter um chat em tempo real com os profissionais!', now()],
  );
  console.log('   ✅  Sugestão criada.');
}

// ─── Blog ─────────────────────────────────────────────────────────────────────

async function seedBlogs() {
  console.log('\n✍️   Criando posts do blog...');

  const eliana = users.find(u => u.email === 'dra.eliana@melodias.com.br')!;
  const existing = (await pool.execute('SELECT COUNT(*) AS c FROM blog_posts') as [unknown[], unknown])[0] as {c:number}[];
  if (existing[0].c > 0) { console.log('   ⚠  Posts já existem, pulando.'); return; }

  const posts = [
    {
      title: 'Depressão x Tristeza: entenda a diferença',
      excerpt: 'Nem toda tristeza é depressão — mas como saber a diferença?',
      content: '<p>A tristeza é uma emoção natural e passageira. A depressão é um transtorno que persiste por semanas ou meses...</p>',
      category: 'Saúde Mental',
      readTime: '5 min',
    },
    {
      title: 'O que é detox de dopamina e como praticar',
      excerpt: 'Reduzir estímulos digitais pode transformar sua clareza mental.',
      content: '<p>O detox de dopamina propõe reduzir comportamentos que geram recompensas rápidas, como redes sociais e streaming...</p>',
      category: 'Bem-estar',
      readTime: '7 min',
    },
  ];

  for (const p of posts) {
    const n = now();
    await execute(
      `INSERT INTO blog_posts
       (id, title, excerpt, content, category, author_id, author_name, read_time, liked_by, published, post_date, updated_at)
       VALUES (?,?,?,?,?,?,?,?,'[]',1,?,?)`,
      [newId(), p.title, p.excerpt, p.content, p.category, eliana.id, 'Dra. Eliana Costa', p.readTime, n, n],
    );
    console.log(`   ✅  ${p.title}`);
  }
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  console.log('\n🎵  Espalhe Melodias — Seed\n');
  try {
    await seedUsers();
    await seedProfessionals();
    await seedForum();
    await seedMaterials();
    await seedEvents();
    await seedSuggestions();
    await seedBlogs();
    console.log('\n🎉  Seed concluído!\n');
  } catch (err) {
    console.error('\n❌  Erro no seed:\n', err);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

main();
