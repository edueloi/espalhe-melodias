import { AppUser, ProfessionalProfile, ForumTopic, SupportMaterial, HealthEvent, SupportRequest, SuggestionIdea, BlogPost } from './types';

export const INITIAL_USERS: AppUser[] = [
  {
    id: 'usr-1',
    name: 'Karen Silveira',
    email: 'karen.adm@melodias.com.br',
    role: 'super-admin',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=200&auto=format&fit=crop',
    approvalStatus: 'approved'
  },
  {
    id: 'usr-2',
    name: 'Dra. Eliana Mendes',
    email: 'dra.eliana@melodias.com.br',
    role: 'professional',
    avatar: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?q=80&w=200&auto=format&fit=crop',
    specialty: 'Terapia Cognitivo-Comportamental (TCC)',
    crp: 'CRP 06/142859',
    approvalStatus: 'approved'
  },
  {
    id: 'usr-3',
    name: 'Gabriel Souza',
    email: 'gabriel.souza@gmail.com',
    role: 'member',
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=200&auto=format&fit=crop',
    approvalStatus: 'approved'
  },
  {
    id: 'usr-4',
    name: 'Dr. Marcos Toledo',
    email: 'dr.marcos@melodias.com.br',
    role: 'professional',
    avatar: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?q=80&w=200&auto=format&fit=crop',
    specialty: 'Neuropsicologia & Burnout',
    crp: 'CRP 06/98715',
    approvalStatus: 'approved'
  },
  {
    id: 'usr-5',
    name: 'Mariana Duarte',
    email: 'mariana.duarte@outlook.com',
    role: 'member',
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=80&w=200&auto=format&fit=crop',
    approvalStatus: 'pending' // Waiting for admin approval in "Solicitações"
  }
];

export const INITIAL_PROFESSIONALS: ProfessionalProfile[] = [
  {
    id: 'prof-1',
    userId: 'usr-2',
    name: 'Dra. Eliana Mendes',
    avatar: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?q=80&w=200&auto=format&fit=crop',
    crp: 'CRP 06/142859',
    specialties: ['Ansiedade', 'Depressão', 'Terapia de Casal', 'Autoconhecimento'],
    bio: 'Psicóloga clínica com mais de 10 anos de experiência auxiliando adultos a navegarem por crises de ansiedade, desafios emocionais e transições de carreira. Minha abordagem principal é a Terapia Cognitivo-Comportamental, oferecendo um espaço acolhedor, focado em soluções e sem julgamentos.',
    pricePerSession: 140,
    rating: 4.9,
    reviewsCount: 42,
    contactWhatsapp: '5511999990001',
    services: [
      'Psicoterapia Individual (Online)',
      'Terapia de Casal e Familiar',
      'Mentoria para Controle de Stress',
      'Acompanhamento de Transtornos de Humor'
    ],
    schedule: ['Segunda 09:00', 'Segunda 14:00', 'Quarta 10:00', 'Quarta 16:00', 'Sexta 11:00'],
    location: 'remoto / São Paulo - SP',
    accentColor: '#581a2e',
    languages: ['Português', 'Espanhol'],
    instagram: '@dra.eliana.mendes',
    linkedin: 'dra-eliana-mendes',
    website: 'https://dra-eliana.com.br',
  },
  {
    id: 'prof-2',
    userId: 'usr-4',
    name: 'Dr. Marcos Toledo',
    avatar: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?q=80&w=200&auto=format&fit=crop',
    crp: 'CRP 06/98715',
    specialties: ['Burnout', 'Stress Ocupacional', 'TDAH em Adultos', 'Depressão'],
    bio: 'Especialista em Neuropsicologia e Psicologia Organizacional. Minhas sessões são pautadas na compreensão biológica do stress e na reestruturação neurocognitiva para lidar com ambientes de alta performance sem comprometer a saúde mental. Trabalho com foco em prevenção de esgotamento.',
    pricePerSession: 160,
    rating: 5.0,
    reviewsCount: 29,
    contactWhatsapp: '5511999990002',
    services: [
      'Consulta Neuropsicológica Integrativa',
      'Diagnóstico de Burnout & Plano de Retomada',
      'Terapia Focada em TDAH Adulto',
      'Orientação Profissional'
    ],
    schedule: ['Terça 08:00', 'Terça 15:00', 'Quinta 13:00', 'Quinta 19:00'],
    location: 'remoto / Campinas - SP',
    accentColor: '#1e3a8a',
    languages: ['Português', 'Inglês'],
    instagram: '@dr.marcos.toledo',
    linkedin: 'dr-marcos-toledo',
    twitter: '@drmarcostoledo',
    website: 'https://dr-marcos-toledo.com.br',
  },
  {
    id: 'prof-3',
    userId: 'usr-6',
    name: 'Dra. Aline Becker',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=200&auto=format&fit=crop',
    crp: 'CRP 06/88350',
    specialties: ['Autoestima', 'Mulheres & Maternidade', 'Luto', 'Relacionamentos'],
    bio: 'Ajudo mulheres a reconstruírem sua autoestima, lidarem com as pressões da maternidade, superarem divórcios e resgatarem seu poder pessoal através de uma psicoterapia com sensibilidade de gênero e escuta qualificada de base humanista clássica.',
    pricePerSession: 130,
    rating: 4.8,
    reviewsCount: 37,
    contactWhatsapp: '5521999990003',
    services: [
      'Acolhimento Terapêutico Feminino',
      'Acompanhamento de Gestantes/Puerpério',
      'Sessões de Processamento de Luto',
      'Terapia para Construção de Limites'
    ],
    schedule: ['Segunda 11:00', 'Terça 10:00', 'Quarta 15:00', 'Quinta 16:00'],
    location: 'remoto / Rio de Janeiro - RJ',
    accentColor: '#10b981',
    languages: ['Português'],
    instagram: '@dra.alinebecker',
    facebook: 'dra.alinebecker',
    extraLinks: [{ label: 'Podcast Mulheres que Curam', url: 'https://open.spotify.com' }],
  },
  {
    id: 'prof-4',
    userId: 'usr-7',
    name: 'Dra. Camila Santos',
    avatar: 'https://images.unsplash.com/photo-1551836022-d5d88e9218df?q=80&w=200&auto=format&fit=crop',
    crp: 'CRP 06/200581',
    specialties: ['Mindfulness', 'Terapia de Aceitação e Compromisso', 'Transtorno Pânico'],
    bio: 'Praticante avançada de Mindfulness aplicado à saúde emocional. Busco integrar técnicas corporais de regulação nervosa com a psicologia analítica moderna, auxiliando principalmente pacientes que lidam com fobias intensas e pânico intermitente.',
    pricePerSession: 150,
    rating: 4.9,
    reviewsCount: 22,
    contactWhatsapp: '5511999990004',
    services: [
      'Terapia de Aceitação e Compromisso',
      'Sessão Guiada de Mindfulness Terapêutico',
      'Gestão de Crises e Ataques de Pânico',
      'Práticas de Redução de Reatividade Sensorial'
    ],
    schedule: ['Quarta 08:00', 'Quarta 11:00', 'Sexta 10:00', 'Sexta 14:00', 'Sexta 15:00'],
    location: 'remoto / Curitiba - PR',
    accentColor: '#6d28d9',
    languages: ['Português', 'Inglês', 'Francês'],
    instagram: '@dra.camilasantos.psi',
    tiktok: '@dracamilasantos',
    website: 'https://camilasantos.psi.br',
    extraLinks: [{ label: 'Canal YouTube', url: 'https://youtube.com' }],
  }
];

export const INITIAL_FORUM_TOPICS: ForumTopic[] = [
  {
    id: 'top-1',
    title: 'Como lidar com pensamentos intrusivos de ansiedade à noite?',
    category: 'Ansiedade',
    authorName: 'Gabriel Souza',
    authorRole: 'member',
    authorAvatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=200&auto=format&fit=crop',
    content: 'Olá pessoal do grupo Melodias! Tenho sofrido muito quando encosto a cabeça no travesseiro. Minha mente começa a criar dezenas de cenários ruins e problemas imaginários, o que me dá taquicardia e destrói meu sono. Alguém tem dicas práticas ou exercícios para quebrar esse ciclo?',
    createdAt: '2026-05-29 14:30',
    likes: 12,
    views: 84,
    replies: [
      {
        id: 'rep-1',
        authorName: 'Dra. Eliana Mendes',
        authorRole: 'professional',
        authorAvatar: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?q=80&w=200&auto=format&fit=crop',
        content: 'Olá, Gabriel! Esse é um sintoma clássico de hiperalerta noturno. Uma prática excelente da TCC é a "Hora do Pensamento Coorporativo": reserve 15 minutos às 18h para anotar todas as preocupações. Caso surjam à noite, repita mentalmente: "Disso eu cuidarei amanhã, o papel já guardou". Praticar a respiração diafragmática 4-7-8 também ajuda a modular o sistema nervoso autônomo. Espero ter ajudado!',
        createdAt: '2026-05-29 16:15',
        isExpertReply: true
      },
      {
        id: 'rep-2',
        authorName: 'Karen Silveira',
        authorRole: 'super-admin',
        authorAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=200&auto=format&fit=crop',
        content: 'Nossa, Gabriel, eu passei por isso recentemente! Praticar os guias de áudios meditativos na nossa aba de "Materiais de Apoio" ajudou muito a ancorar minha mente nos sons e sair da espiral. Recomendo muito o áudio de 5 minutos sobre respiração guiada!',
        createdAt: '2026-05-29 17:00',
        isExpertReply: false
      }
    ],
    isSolved: true
  },
  {
    id: 'top-2',
    title: 'Estou sentindo que vou explodir de cansaço no trabalho (Sinais de Burnout?)',
    category: 'Depressão',
    authorName: 'Lucas Oliveira',
    authorRole: 'member',
    authorAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=200&auto=format&fit=crop',
    content: 'Faz cerca de 3 meses que sinto que minha energia foi totalmente drenada. Mesmo após o final de semana, acordo segunda-feira exausto, sinto irritabilidade constante com colegas de equipe e um sentimento de que nada do que faço tem valor real. Como saber se ultrapassei o limite do stress comum?',
    createdAt: '2026-05-28 09:12',
    likes: 18,
    views: 110,
    replies: [
      {
        id: 'rep-3',
        authorName: 'Dr. Marcos Toledo',
        authorRole: 'professional',
        authorAvatar: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?q=80&w=200&auto=format&fit=crop',
        content: 'Excelente relato, Lucas. A irritabilidade, o distanciamento mental (despersonalização) e a sensação de ineficácia profissional são o tripé definidor da Síndrome de Burnout. Isso não é mera preguiça ou fraqueza. É uma resposta crônica ao estresse ambiental. Recomendo avaliar com urgência seus limites, buscar auxílio psicológico focado em carreira e, se possível, fazer pausas curtas regulares (método pomodoro) ao longo de cada jornada.',
        createdAt: '2026-05-28 11:45',
        isExpertReply: true
      }
    ],
    isSolved: false
  }
];

export const INITIAL_MATERIALS: SupportMaterial[] = [
  {
    id: 'mat-1',
    title: 'Guia Definitivo Contra Crises de Pânico',
    category: 'Ansiedade',
    type: 'E-book',
    description: 'Um manual prático estruturado por psicólogos clínicos contendo técnicas fisiológicas e cognitivas passo-a-passo para desarmar a descarga de adrenalina do pânico em menos de 5 minutos.',
    downloadUrl: '#',
    authorName: 'Dra. Eliana Mendes',
    dateAdded: '2026-05-15',
    restrictedToMembers: false
  },
  {
    id: 'mat-2',
    title: 'Áudio de Mindfulness: Desacelerando a Mente',
    category: 'Meditação',
    type: 'Áudio',
    description: 'Exercício guiado de meditação de 10 minutos focado na ancoragem corporal, ideal para reduzir o estresse crônico ao meio-dia ou antes de dormir.',
    downloadUrl: '#',
    authorName: 'Dra. Camila Santos',
    dateAdded: '2026-05-20',
    restrictedToMembers: true
  },
  {
    id: 'mat-3',
    title: 'Planner de Rotina de Autocuidado Diário',
    category: 'Autocuidado',
    type: 'Guia de Exercícios',
    description: 'Folha de atividades imprimível ou editável para estabelecer micro-metas de saúde, hidratação, sono qualificado e gratidão diária de forma simples e estimulante.',
    downloadUrl: '#',
    authorName: 'Karen Silveira',
    dateAdded: '2026-05-25',
    restrictedToMembers: false
  }
];

export const INITIAL_EVENTS: HealthEvent[] = [
  {
    id: 'evt-1',
    title: 'Grupo de Apoio Mútuo: Ansiedade Social',
    instructorName: 'Dra. Eliana Mendes',
    instructorAvatar: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?q=80&w=200&auto=format&fit=crop',
    date: '2026-06-03',
    time: '19:30 - 21:00',
    description: 'Um espaço seguro de acolhimento para compartilharmos nossas experiências diárias de fobia social, timidez excessiva e medos de julgamento alheio. Com mediação profissional e exercícios estruturados.',
    category: 'Grupo de Apoio',
    status: 'upcoming',
    participantsCount: 9,
    isEnrolled: false
  },
  {
    id: 'evt-2',
    title: 'Workshop: Mindfulness para Lidar com Stress Corporativo',
    instructorName: 'Dra. Camila Santos',
    instructorAvatar: 'https://images.unsplash.com/photo-1551836022-d5d88e9218df?q=80&w=200&auto=format&fit=crop',
    date: '2026-06-10',
    time: '18:00 - 19:30',
    description: 'Práticas dinâmicas de atenção plena voltadas para o ambiente corporativo e sobrecarga mental. Aprenda a lidar com e-mails em excesso, reuniões irritantes e pressões de prazos mantendo o foco do seu sistema nervoso.',
    category: 'Workshop',
    status: 'upcoming',
    participantsCount: 13,
    isEnrolled: true
  },
  {
    id: 'evt-3',
    title: 'Palestra Vivencial: A Neurobiologia do Amor-Próprio',
    instructorName: 'Dr. Marcos Toledo',
    instructorAvatar: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?q=80&w=200&auto=format&fit=crop',
    date: '2026-05-20',
    time: '19:00 - 20:30',
    description: 'Evento gravado. Explicamos cientificamente o impacto hormonal e neural da autocompaixão, comparando cérebros autocríticos e cérebros acolhedores, com dicas de re-neuro-padronização.',
    category: 'Palestra Vivencial',
    status: 'past',
    participantsCount: 45,
    recordingUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ' // Simulated recording embed
  }
];

export const INITIAL_SUPPORT_REQUESTS: SupportRequest[] = [
  {
    id: 'req-1',
    patientName: 'Mariana Duarte',
    patientEmail: 'mariana.duarte@outlook.com',
    urgency: 'alta',
    description: 'Estou há duas semanas sem conseguir dormir bem devido a uma demissão recente. Hoje senti falta de ar severa e uma sensação de morte iminente. Preciso muito conversar com algum especialista credenciado.',
    createdAt: '2026-05-30 09:30',
    status: 'Aberto'
  },
  {
    id: 'req-2',
    patientName: 'Guilherme Lima',
    patientEmail: 'guigui@gmail.com',
    urgency: 'media',
    description: 'Gostaria de agendar orientação terapêutica para lidar com conflitos familiares rotineiros.',
    createdAt: '2026-05-29 11:00',
    status: 'Em Atendimento',
    assignedProfessional: 'Dra. Eliana Mendes'
  }
];

export const INITIAL_SUGGESTIONS: SuggestionIdea[] = [
  {
    id: 'sug-1',
    authorName: 'Ana Clara',
    content: 'Sugiro fazermos um encontro presencial para caminhada ecológica no próximo mês. Exercícios na natureza fazem um bem fantástico para desintoxicação digital!',
    createdAt: '2026-05-30 15:44',
    likes: 4
  },
  {
    id: 'sug-2',
    authorName: 'Roberto M.',
    content: 'Poderíamos criar uma biblioteca de meditação focada exclusivamente em ajudar crianças com TDAH, seria muito relevante para os pais associados!',
    createdAt: '2026-05-28 10:20',
    likes: 2
  }
];

export const INITIAL_BLOGS: BlogPost[] = [
  {
    id: 'blog-1',
    title: 'A diferença crucial entre Tristeza e Depressão Clínica',
    slug: 'tristeza-vs-depressao-clinica',
    excerpt: 'Ficar triste é uma resposta saudável a acontecimentos ruins. A depressão profunda é outra condição física. Entenda os sinais em si e nos outros.',
    content: 'Muitas vezes, a palavra depressão é usada de maneira inadequada para expressar um descontentamento passageiro ou a tristeza decorrente de uma perda (como o término de um relacionamento ou a perda de um familiar). No entanto, de acordo com o Manual Diagnóstico DSM-5, a depressão clínica envolve sintomas físicos prolongados: falta de apetite, letargia profunda ou insônia persistente, perda de interesse em hobbies antigos e ideias de menos valia sem interrupção por mais de 14 dias de forma severa.',
    category: 'Informação',
    image_url: 'https://images.unsplash.com/photo-1518495973542-4542c06a5843?q=80&w=500&auto=format&fit=crop',
    author_name: 'Dra. Eliana Mendes',
    author_id: 'usr-2',
    author_avatar: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?q=80&w=200&auto=format&fit=crop',
    featured: true,
    published: true,
    likes: 24,
    views: 145,
    created_at: '2026-05-25T10:00:00Z',
    updated_at: '2026-05-25T10:00:00Z'
  },
  {
    id: 'blog-2',
    title: 'Desintoxicação Dopaminérgica: Como resetar seu foco diário',
    slug: 'desintoxicacao-dopaminergica-foco',
    excerpt: 'Vivendo em um mundo de notificações instantâneas e rolagem infinita. Veja o método prático de resetar seus receptores de recompensa cerebral.',
    content: 'Em nossa rotina atual, o uso ininterrupto dos smartphones libera microdosagem artificial constante de dopamina no cérebro a cada deslize. O efeito rebote é um tédio profundo diante de tarefas cruciais do trabalho ou de estudos que demandam foco longo. A desintoxicação ajuda a restaurar a gratificação em tarefas que operam em ritmo orgânico (como ler um livro físico ou fazer caminhadas silenciosas).',
    category: 'Estilo de Vida',
    image_url: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?q=80&w=500&auto=format&fit=crop',
    author_name: 'Dr. Marcos Toledo',
    author_id: 'usr-4',
    author_avatar: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?q=80&w=200&auto=format&fit=crop',
    featured: true,
    published: true,
    likes: 18,
    views: 92,
    created_at: '2026-05-28T14:30:00Z',
    updated_at: '2026-05-28T14:30:00Z'
  },
  {
    id: 'blog-3',
    title: 'Burnout: Sinais de Alerta que Ignoramos Até Tarde Demais',
    slug: 'burnout-sinais-alerta',
    excerpt: 'O esgotamento profissional não chega de repente. Existem sinais silenciosos que, se ignorados, levam a crises severas. Saiba como identificá-los.',
    content: 'Burnout é muito mais que cansaço. É um estado de exaustão emocional, despersonalização e redução da realização pessoal. Muitos profissionais ignoram os primeiros sinais: irritabilidade crescente, detalhes pequenos causando frustração, dificuldade de concentração, insônia e queda da imunidade. Quando reconhecido cedo, é possível intervir com mudanças estruturais no trabalho e apoio terapêutico.',
    category: 'Saúde Mental no Trabalho',
    image_url: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a9?q=80&w=500&auto=format&fit=crop',
    author_name: 'Dr. Marcos Toledo',
    author_id: 'usr-4',
    author_avatar: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?q=80&w=200&auto=format&fit=crop',
    featured: false,
    published: true,
    likes: 12,
    views: 78,
    created_at: '2026-06-02T09:15:00Z',
    updated_at: '2026-06-02T09:15:00Z'
  },
  {
    id: 'blog-4',
    title: 'Terapia de Casal: Quando Procurar e o que Esperar',
    slug: 'terapia-casal-como-funciona',
    excerpt: 'Relacionamentos passam por crises. A terapia de casal não é sinal de fracasso, mas de investimento na relação. Entenda como funciona e os benefícios.',
    content: 'Muitos casais esperam até a beira do divórcio para procurar terapia. Na verdade, a terapia de casal é mais eficaz quando iniciada nos primeiros sinais de distância emocional. O processo ajuda a melhorar comunicação, estabelecer limites saudáveis e reconstruir a intimidade. Com ferramentas certas, casais redescobrem a conexão que os uniu.',
    category: 'Relacionamentos',
    image_url: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=500&auto=format&fit=crop',
    author_name: 'Dra. Eliana Mendes',
    author_id: 'usr-2',
    author_avatar: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?q=80&w=200&auto=format&fit=crop',
    featured: false,
    published: true,
    likes: 31,
    views: 156,
    created_at: '2026-06-05T11:45:00Z',
    updated_at: '2026-06-05T11:45:00Z'
  },
  {
    id: 'blog-5',
    title: 'Mindfulness para Crianças: Ferramentas Práticas e Lúdicas',
    slug: 'mindfulness-criancas-pratico',
    excerpt: 'Ensinar crianças a meditar é mais fácil que parece. Veja técnicas lúdicas e acessíveis que desenvolvem atenção plena desde cedo.',
    content: 'Crianças vivem em ritmo acelerado entre escola, atividades extras e telas. Mindfulness oferece pausa necessária. Técnicas simples como "escuta do som" (fechar olhos e identificar 5 sons), "respiração da flor" (inspirar contando 4, reter 4, expirar 4) e "varredura corporal lúdica" ajudam a regular emoções e desenvolver autoconhecimento. Pais podem praticar junto, criando momentos de conexão.',
    category: 'Crianças e Adolescentes',
    image_url: 'https://images.unsplash.com/photo-1587825140708-dfaf72ae4b04?q=80&w=500&auto=format&fit=crop',
    author_name: 'Karen Silveira',
    author_id: 'usr-1',
    author_avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=200&auto=format&fit=crop',
    featured: false,
    published: true,
    likes: 45,
    views: 203,
    created_at: '2026-06-08T16:20:00Z',
    updated_at: '2026-06-08T16:20:00Z'
  },
  {
    id: 'blog-6',
    title: 'Ansiedade Social: Da Fobia à Autoconfiança em Ambientes',
    slug: 'ansiedade-social-fobia-social',
    excerpt: 'Fobia social limita carreiras e relacionamentos. Descubra técnicas cognitivas comportamentais que transformam o medo em confiança.',
    content: 'Ansiedade social vai além de timidez. É o medo paralisante de julgamento alheio em ambientes sociais. Os sintomas incluem taquicardia, tremores, sudorese e bloqueio mental. Técnicas TCC como exposição gradual (começar em ambientes pequenos e progredir), reestruturação cognitiva (questionar pensamentos catastróficos) e treinamento de assertividade transformam a relação com interações sociais ao longo do tempo.',
    category: 'Transtornos de Ansiedade',
    image_url: 'https://images.unsplash.com/photo-1552881760-6cffdc8787e0?q=80&w=500&auto=format&fit=crop',
    author_name: 'Dra. Eliana Mendes',
    author_id: 'usr-2',
    author_avatar: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?q=80&w=200&auto=format&fit=crop',
    featured: true,
    published: true,
    likes: 38,
    views: 187,
    created_at: '2026-06-10T13:00:00Z',
    updated_at: '2026-06-10T13:00:00Z'
  }
];

// ─── Newsletter Subscriptions ──────────────────────────────────────────────

export const INITIAL_NEWSLETTERS: Array<{ email: string; subscribed_at: string }> = [
  { email: 'joao.silva@gmail.com', subscribed_at: '2026-05-15T10:30:00Z' },
  { email: 'ana.costa@outlook.com', subscribed_at: '2026-05-20T14:45:00Z' },
  { email: 'carlos.oliveira@yahoo.com', subscribed_at: '2026-05-25T09:15:00Z' }
];

// ─── Contact Messages ────────────────────────────────────────────────────

export const INITIAL_CONTACT_MESSAGES: Array<{
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
  created_at: string;
}> = [
  {
    name: 'Patricia Mendes',
    email: 'patricia.m@gmail.com',
    phone: '(11) 98765-4321',
    subject: 'Dúvida sobre Filiação',
    message: 'Gostaria de saber como funciona a filiação e se há desconto para profissionais iniciantes. Sou psicóloga formada há 2 meses.',
    created_at: '2026-06-10T15:30:00Z'
  },
  {
    name: 'Ricardo Costa',
    email: 'ricardo.costa@empresa.com',
    phone: '(21) 97654-3210',
    subject: 'Parcerias Corporativas',
    message: 'Somos uma empresa de tecnologia em RJ interessada em programas de bem-estar mental para nossos 150 funcionários. Podemos conversar sobre possibilidades?',
    created_at: '2026-06-08T11:00:00Z'
  },
  {
    name: 'Fernanda Alves',
    email: 'fe.alves@hotmail.com',
    subject: 'Feedback do 1º Encontro',
    message: 'Adorei o encontro de maio! Conhecer vocês presencialmente foi transformador. Quando será o próximo? Gostaria de levar uma amiga.',
    created_at: '2026-06-05T09:45:00Z'
  }
];

// ─── Instagram Posts (Mock) ────────────────────────────────────────────────

export const INITIAL_INSTAGRAM_POSTS = [
  {
    id: 'ig-1',
    image_url: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?q=80&w=500&auto=format&fit=crop',
    caption: '1º Encontro Espalhe Melodias foi incrível! 22 profissionais da saúde mental reunidos em Tatuí criando conexões reais e significativas. 🎵✨',
    likes_count: 234,
    comments_count: 18,
    instagram_url: 'https://instagram.com/espalhemelodiasoficial',
    published_at: '2026-06-01T15:30:00Z'
  },
  {
    id: 'ig-2',
    image_url: 'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?q=80&w=500&auto=format&fit=crop',
    caption: 'A dinâmica de conexão foi o momento mais especial. Risos, abraços e histórias que tocaram corações. Comunidade que acolhe é comunidade que cura! 💚',
    likes_count: 187,
    comments_count: 24,
    instagram_url: 'https://instagram.com/espalhemelodiasoficial',
    published_at: '2026-06-02T10:15:00Z'
  },
  {
    id: 'ig-3',
    image_url: 'https://images.unsplash.com/photo-1600880292089-90a7e086ee0c?q=80&w=500&auto=format&fit=crop',
    caption: 'Workshop de Mindfulness com a equipe: Aprendendo técnicas simples e poderosas para reduzir stress e aumentar presença no dia a dia. 🧘‍♀️🌟',
    likes_count: 156,
    comments_count: 12,
    instagram_url: 'https://instagram.com/espalhemelodiasoficial',
    published_at: '2026-06-03T14:00:00Z'
  },
  {
    id: 'ig-4',
    image_url: 'https://images.unsplash.com/photo-1587825140708-dfaf72ae4b04?q=80&w=500&auto=format&fit=crop',
    caption: 'Novo artigo no blog: "Desintoxicação Dopaminérgica – Como resetar seu foco diário". Link na bio! 📖✨ #SaúdeMental #Produtividade',
    likes_count: 142,
    comments_count: 31,
    instagram_url: 'https://instagram.com/espalhemelodiasoficial',
    published_at: '2026-06-04T11:30:00Z'
  },
  {
    id: 'ig-5',
    image_url: 'https://images.unsplash.com/photo-1528605248644-14dd04022da1?q=80&w=500&auto=format&fit=crop',
    caption: 'Grupos de Apoio Mútuo todas as quintas-feiras! Temas: Ansiedade Social, Burnout, Relacionamentos. Espaço seguro para compartilhar e se conectar. 🤝💜',
    likes_count: 198,
    comments_count: 27,
    instagram_url: 'https://instagram.com/espalhemelodiasoficial',
    published_at: '2026-06-06T16:45:00Z'
  },
  {
    id: 'ig-6',
    image_url: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=500&auto=format&fit=crop',
    caption: 'Conexões que transformam! 🎵 Ser parte da Espalhe Melodias significa ser ouvido, validado e apoiado por uma comunidade que realmente se importa. #ComunidadeMelodia',
    likes_count: 267,
    comments_count: 42,
    instagram_url: 'https://instagram.com/espalhemelodiasoficial',
    published_at: '2026-06-08T13:20:00Z'
  },
  {
    id: 'ig-7',
    image_url: 'https://images.unsplash.com/photo-1552883750-104fdf6edbe0?q=80&w=500&auto=format&fit=crop',
    caption: 'Lembrete importante: Cuidar da saúde mental é um ato de amor próprio! Se você está lutando, não está sozinho. Procure ajuda profissional. 💚✨',
    likes_count: 312,
    comments_count: 58,
    instagram_url: 'https://instagram.com/espalhemelodiasoficial',
    published_at: '2026-06-09T10:00:00Z'
  },
  {
    id: 'ig-8',
    image_url: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?q=80&w=500&auto=format&fit=crop',
    caption: 'Próximo encontro marcado para agosto em SP! 🎵 Mais conexões reais, mais histórias transformadoras, mais melodias de esperança. Vocês topam?',
    likes_count: 189,
    comments_count: 35,
    instagram_url: 'https://instagram.com/espalhemelodiasoficial',
    published_at: '2026-06-10T15:10:00Z'
  },
  {
    id: 'ig-9',
    image_url: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?q=80&w=500&auto=format&fit=crop',
    caption: 'Testimonial da semana: "Espalhe Melodias mudou minha vida. Encontrei um espaço de acolhimento que nunca tive. Aqui, minhas dores fazem sentido." 💚',
    likes_count: 276,
    comments_count: 44,
    instagram_url: 'https://instagram.com/espalhemelodiasoficial',
    published_at: '2026-06-11T12:30:00Z'
  }
];

// ─── Stories/Highlights ───────────────────────────────────────────────────

export const INITIAL_STORIES = [
  {
    id: 'story-1',
    title: 'Encontros',
    image_url: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?q=80&w=300&auto=format&fit=crop',
    order: 1,
    category: 'evento',
    link: '#eventos'
  },
  {
    id: 'story-2',
    title: 'Galeria',
    image_url: 'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?q=80&w=300&auto=format&fit=crop',
    order: 2,
    category: 'galeria',
    link: '#galeria'
  },
  {
    id: 'story-3',
    title: 'Workshops',
    image_url: 'https://images.unsplash.com/photo-1600880292089-90a7e086ee0c?q=80&w=300&auto=format&fit=crop',
    order: 3,
    category: 'workshop',
    link: '#eventos'
  },
  {
    id: 'story-4',
    title: 'Blog',
    image_url: 'https://images.unsplash.com/photo-1552881760-6cffdc8787e0?q=80&w=300&auto=format&fit=crop',
    order: 4,
    category: 'blog',
    link: '#blog'
  },
  {
    id: 'story-5',
    title: 'Comunidade',
    image_url: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=300&auto=format&fit=crop',
    order: 5,
    category: 'comunidade',
    link: '#sobre'
  }
];
