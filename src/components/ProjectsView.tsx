import React, { useState, useEffect } from 'react';
import {
  Music,
  Brain,
  Heart,
  Lightbulb,
  Sparkle,
  ArrowLeft,
  ArrowRight,
  Play,
  Pause,
  Info,
  User,
  ShieldCheck,
  Check,
  Users,
  Layers,
  MessageSquare,
  Share2,
  Calendar,
  X,
  HelpCircle,
  TrendingUp,
  Award
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { PageWrapper } from './ui/PageWrapper';

// Interfaces for our custom interactive feedback responses
interface FeedbackNote {
  id: string;
  question1: string; // O que achou do nosso encontro?
  question2: string; // Qual a sua maior necessidade profissional hoje?
  question3: string; // Que ajuda você poderia oferecer para alguém deste grupo?
  authorName: string;
  createdAt: string;
  color: string;
}

export default function ProjectsView() {
  const [activeSlide, setActiveSlide] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [revealSaboteurId, setRevealSaboteurId] = useState<string | null>(null);
  const [selectedConnectionKey, setSelectedConnectionKey] = useState<string | null>('escuta');
  
  // Feedback note state for dynamic user interactions
  const [feedbackNotes, setFeedbackNotes] = useState<FeedbackNote[]>(() => {
    const saved = localStorage.getItem('melodias_project_feedback');
    if (saved) return JSON.parse(saved);
    return [
      {
        id: 'note-1',
        question1: 'Incrível! A sinergia entre música e psicologia traz uma dimensão de acolhimento sem igual.',
        question2: 'Superar o isolamento do consultório e encontrar parceiros de indicação segura.',
        question3: 'Compartilhar materiais sobre TCC e orientações de transição de carreira.',
        authorName: 'Dra. Aline Becker',
        createdAt: 'Haver 10min',
        color: 'bg-[#faf3e8] border-[#eacfaf]'
      },
      {
        id: 'note-2',
        question1: 'Um divisor de águas na saúde mental. Os encontros mensais são um respiro ético e humano.',
        question2: 'Espaço prático para debates de casos difíceis respeitando o sigilo absoluto.',
        question3: 'Oferecer workshops de mindfulness para terapeutas que sofrem com stress.',
        authorName: 'Dr. Marcos Toledo',
        createdAt: 'Haver 30min',
        color: 'bg-[#f1f5e8] border-[#d3dfb8]'
      }
    ];
  });

  // Feedback form fields
  const [formQ1, setFormQ1] = useState('');
  const [formQ2, setFormQ2] = useState('');
  const [formQ3, setFormQ3] = useState('');
  const [formAuthor, setFormAuthor] = useState('');
  const [submitSuccess, setSubmitSuccess] = useState(false);

  useEffect(() => {
    localStorage.setItem('melodias_project_feedback', JSON.stringify(feedbackNotes));
  }, [feedbackNotes]);

  // Slides structure mimicking the actual presentation but transformed into premium web templates
  const slides = [
    {
      id: 'welcome',
      title: 'Sejam todos bem-vindos!',
      subtitle: 'Conexões em Saúde Mental',
      bgType: 'welcome'
    },
    {
      id: 'origin',
      title: 'Nasceu o Espalhe Melodias',
      subtitle: 'Fortalecer e crescermos juntos',
      bgType: 'editorial'
    },
    {
      id: 'purpose',
      title: 'Espalhe Melodias: Pilares',
      subtitle: 'Propósitos, Visão e Valores',
      bgType: 'editorial'
    },
    {
      id: 'why-meet',
      title: 'O que nos faz reunir?',
      subtitle: 'Superando desafios comuns do psicoterapeuta',
      bgType: 'editorial'
    },
    {
      id: 'connection-flow',
      title: 'Dinâmica de Conexão',
      subtitle: 'Formando uma sinfonia saudável de trocas',
      bgType: 'interactive-circle'
    },
    {
      id: 'saboteurs',
      title: 'Os Sabotadores da Construção',
      subtitle: 'Neutralizando atitudes para expandir a rede',
      bgType: 'grid-interactive'
    },
    {
      id: 'how-works',
      title: 'Como vamos funcionar?',
      subtitle: 'Plataforma integrada e ritmos de encontro',
      bgType: 'timeline'
    },
    {
      id: 'founders',
      title: 'Quem Somos',
      subtitle: 'As idealizadoras do Espalhe Melodias',
      bgType: 'profiles'
    },
    {
      id: 'feedback-interactive',
      title: 'Queremos Te Ouvir!',
      subtitle: 'Compartilhar é cuidar',
      bgType: 'interactive-form'
    }
  ];

  // Auto-scroller for the slideshow simulation
  useEffect(() => {
    let interval: any;
    if (isPlaying) {
      interval = setInterval(() => {
        setActiveSlide(prev => (prev + 1) % slides.length);
      }, 7000);
    }
    return () => clearInterval(interval);
  }, [isPlaying, slides.length]);

  const handleNext = () => {
    setActiveSlide(prev => (prev + 1) % slides.length);
  };

  const handlePrev = () => {
    setActiveSlide(prev => (prev - 1 + slides.length) % slides.length);
  };

  const submitFeedbackForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formQ1.trim() || !formQ2.trim() || !formQ3.trim()) {
      alert('Por favor, preencha as questões essenciais para nos ajudar na construção escolar.');
      return;
    }

    const colorOptions = [
      'bg-[#faf3e8] border-[#eacfaf]',
      'bg-[#f1f5e8] border-[#d3dfb8]',
      'bg-[#e9eff5] border-[#b0cbdf]',
      'bg-[#f4e9eb] border-[#dfb0bc]'
    ];
    const randomColor = colorOptions[Math.floor(Math.random() * colorOptions.length)];

    const newNote: FeedbackNote = {
      id: `fn-${Date.now()}`,
      question1: formQ1,
      question2: formQ2,
      question3: formQ3,
      authorName: formAuthor.trim() || 'Psicólogo Convidado',
      createdAt: 'Agora mesmo',
      color: randomColor
    };

    setFeedbackNotes(prev => [newNote, ...prev]);
    setFormQ1('');
    setFormQ2('');
    setFormQ3('');
    setFormAuthor('');
    setSubmitSuccess(true);
    setTimeout(() => setSubmitSuccess(false), 3000);
  };

  // Connection dynamic options mapping matching Slide 2
  const connectionsMap = {
    escuta: {
      title: 'Escuta Sensível',
      desc: 'Escutar com atenção plena e empatia genuína. O silêncio qualificado acolhe a dor e resgata as melodias internas de quem compartilha.',
      color: 'bg-[#5a6242] text-white',
      badge: 'Escuta com Atenção & Empatia'
    },
    respeito: {
      title: 'Respeito Descondicionado',
      desc: 'Reconhecimento das histórias singulares e das barreiras individuais. Uma rede saudável respeita a ética e a liberdade de cada profissional.',
      color: 'bg-[#a75a35] text-white',
      badge: 'Singularidades Valorizadas'
    },
    troca: {
      title: 'Troca Recíproca',
      desc: 'Transmissão livre de saberes práticos, materiais clínicos e referências sem medo de concorrência. Quanto mais compartilhamos, mais nos completamos.',
      color: 'bg-[#182638] text-white',
      badge: 'Troca que Inspira'
    },
    conexoes: {
      title: 'Conexões Reais',
      desc: 'Transparência nas relações gerando novas possibilidades clínicas, parcerias intelectuais e indicações confiáveis que impulsionam a psicologia.',
      color: 'bg-[#c57b57] text-white',
      badge: 'Vínculos Sadios e Duradouros'
    },
    apoio: {
      title: 'Apoio Múltiplo',
      desc: 'Suporte clínico e existencial para lidar com o peso e isolamento técnico da atuação solitária no consultório comum.',
      color: 'bg-[#808b5e] text-white',
      badge: 'Sustentação Mutua'
    }
  };

  // Saboteurs options mapping matching Slide 4
  const sabotadoresList = [
    {
      id: 's-1',
      title: 'Competição Excessiva',
      revelation: 'Prejudica o senso de grupo ao encarar colegas como rivais mercadológicos.',
      remedio: 'Substitua pela cooperação ativa. Indique pacientes cujo perfil se alinha melhor à especialidade do seu colega.',
      color: 'border-amber-300 bg-amber-500/5 text-amber-950'
    },
    {
      id: 's-2',
      title: 'Comparação Tóxica',
      revelation: 'Gera paralisia e sentimento de ineficácia profissional fundamentado nas redes sociais alheias.',
      remedio: 'Entenda que cada psicoterapeuta tem um ritmo orgânico de melodia e uma abordagem única a florescer.',
      color: 'border-orange-300 bg-orange-500/5 text-orange-950'
    },
    {
      id: 's-3',
      title: 'Ego Clínico',
      revelation: 'Prioriza a autoafirmação intelectual em detrimento da escuta sensível dos pares.',
      remedio: 'Pratique a escuta aberta. O saber clínico é construído na humilde união mútua de caminhos de estudo.',
      color: 'border-rose-300 bg-rose-500/5 text-rose-950'
    },
    {
      id: 's-4',
      title: 'Individualismo Estrito',
      revelation: 'Recusa-se a construir redes de amparo cooperativo buscando unicamente o benefício singular.',
      remedio: 'Cada melodia tocada isoladamente é apenas uma nota. Juntos, criamos uma sinfonia inspiradora.',
      color: 'border-stone-300 bg-stone-500/5 text-stone-950'
    },
    {
      id: 's-5',
      title: 'Julgamento Técnico',
      revelation: 'Anula ou ataca metodologias de outras linhas da psicologia científica.',
      remedio: 'Busque a integração multidisciplinar. A complexidade mental humana necessita de múltiplas abordagens clínicas sadias.',
      color: 'border-teal-300 bg-teal-500/5 text-teal-950'
    },
    {
      id: 's-6',
      title: 'Falta de Participação',
      revelation: 'Permanecer invisível, deixando de somar e interagir nos espaços da comunidade.',
      remedio: 'Sua presença fortalece a nossa egrégora. Compartilhar experiências simples acalma e guia outras histórias.',
      color: 'border-indigo-300 bg-indigo-500/5 text-indigo-950'
    },
    {
      id: 's-7',
      title: 'Esperar sem Oferecer',
      revelation: 'Exigir indicações imediatas de pacientes sem nutrir qualquer relacionamento com o grupo.',
      remedio: 'Construa pertencimento sincero de forma gradual. A confiança consolidada é consequência natural do afeto compartilhado.',
      color: 'border-emerald-300 bg-emerald-500/5 text-emerald-950'
    }
  ];

  return (
    <PageWrapper mobileBottomPad id="projects-showcase-root">
    <div className="space-y-6 sm:space-y-8 animate-fadeIn">
      
      {/* SECTION TITLE & MOTORS */}
      <div className="border-b border-brand-sand/60 pb-6 flex flex-col xl:flex-row xl:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] font-bold text-brand-clay uppercase tracking-widest block mb-1">MÓDULO INSTITUCIONAL</span>
          <h2 className="text-2xl md:text-3xl font-serif font-bold text-brand-navy tracking-tight">
            Nossa Estação de Conexões <span className="font-script text-brand-clay text-3xl font-normal block sm:inline-block">Espalhe Melodias</span>
          </h2>
          <p className="text-xs text-brand-navy-light mt-1">
            Conectando profissionais da psicologia por meio de encontros, ética sensível e caminhos integrados de saúde integral.
          </p>
        </div>

        {/* PPT Remote control */}
        <div className="flex items-center space-x-3 bg-white p-2 rounded-2xl border border-brand-sand shadow-sm self-start">
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className={`p-2 rounded-xl border transition-all ${
              isPlaying 
                ? 'bg-amber-100 text-amber-700 border-amber-200' 
                : 'bg-brand-cream hover:bg-brand-sand/35 text-brand-navy border-brand-sand'
            } flex items-center space-x-1 cursor-pointer`}
            title={isPlaying ? "Pausar reprodução automática" : "Iniciar reprodução automática"}
          >
            {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-brand-navy" />}
            <span className="text-[10px] font-bold uppercase tracking-wider hidden sm:inline">
              {isPlaying ? 'Reproduzindo' : 'Auto Play'}
            </span>
          </button>

          <div className="h-6 w-px bg-brand-sand"></div>

          <div className="flex items-center space-x-1">
            <button
              onClick={handlePrev}
              className="p-1 px-2.5 bg-brand-cream hover:bg-brand-sand/40 border border-brand-sand rounded-xl text-brand-navy transition cursor-pointer"
              title="Slide Anterior"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <span className="text-xs font-mono font-bold text-slate-550 px-2 select-none">
              {(activeSlide + 1).toString().padStart(2, '0')} / {slides.length.toString().padStart(2, '0')}
            </span>
            <button
              onClick={handleNext}
              className="p-1 px-2.5 bg-brand-cream hover:bg-brand-sand/40 border border-brand-sand rounded-xl text-brand-navy transition cursor-pointer"
              title="Próximo Slide"
            >
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* CORE CAROUSEL SCREEN FRAME WITH FULL BRAND COLORS */}
      <div className="relative shadow-2xl rounded-3xl border border-brand-sand overflow-hidden bg-brand-cream aspect-[16/10] sm:aspect-[16/9.5] min-h-[480px]">
        
        {/* Decorative Top Accent line representing botanical feel */}
        <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-brand-clay via-brand-moss to-brand-moss-light z-30"></div>

        {/* Slide Deck Container with CSS Fade animations */}
        <div className="w-full h-full p-6 sm:p-12 pb-16 flex flex-col justify-between relative overflow-y-auto">
          
          <AnimatePresence mode="wait">
            <motion.div
              key={activeSlide}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.4 }}
              className="flex-1 flex flex-col justify-between w-full h-full"
            >
              
              {/* Slide Context Indicator */}
              <div className="flex items-center justify-between border-b border-brand-sand/40 pb-3 mb-4 shrink-0">
                <div className="flex items-center space-x-2">
                  <Music className="w-5 h-5 text-brand-clay" />
                  <span className="text-[10px] font-bold uppercase tracking-widest text-[#5a6242] font-sans">
                    Espalhe Melodias
                  </span>
                  <span>·</span>
                  <span className="text-[10px] text-slate-400 font-bold font-mono">
                    Slide {(activeSlide + 1).toString().padStart(2, '0')}
                  </span>
                </div>
                <span className="text-[10px] font-bold text-brand-clay bg-brand-sand px-2.5 py-0.5 rounded-full uppercase">
                  {slides[activeSlide].subtitle}
                </span>
              </div>

              {/* SLIDE RENDER CORRIDORS */}
              <div className="flex-1 flex flex-col justify-center py-4">
                
                {/* 1. WELCOME INTRO SLIDE */}
                {slides[activeSlide].id === 'welcome' && (
                  <div className="text-center space-y-6 max-w-2xl mx-auto py-6">
                    <div className="relative inline-block">
                      {/* Brain + Clef graphical icon with glowing pulse */}
                      <div className="w-24 h-24 rounded-full bg-brand-sand/50 border border-brand-sand/80 flex items-center justify-center mx-auto shadow-inner">
                        <Brain className="w-12 h-12 text-[#5a6242] animate-pulse-slow" />
                      </div>
                      <div className="absolute -top-1 -right-1 bg-brand-clay text-white p-1 rounded-full border-2 border-brand-cream">
                        <Sparkle className="w-4 h-4 fill-white" />
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h3 className="text-[10px] font-bold tracking-widest text-slate-400 uppercase">ACOLHIMENTO E INTEGRAÇÃO</h3>
                      <h1 className="text-4xl sm:text-5xl font-serif font-black text-brand-navy leading-tight tracking-tight">
                        Sejam todos <span className="font-script text-brand-clay text-5xl sm:text-6xl font-normal block mt-1">bem-vindos!</span>
                      </h1>
                      <div className="w-16 h-0.5 bg-brand-clay mx-auto"></div>
                      <p className="text-xs sm:text-sm font-semibold text-brand-navy-light uppercase tracking-wider">
                        ao 1º Encontro do Espalhe Melodias
                      </p>
                    </div>

                    <p className="text-xs bg-brand-sand/40 border border-brand-sand py-2.5 px-6 rounded-2xl max-w-lg mx-auto text-slate-600 leading-relaxed italic">
                      "Conexões que transformam, propósitos que inspiram."
                    </p>
                  </div>
                )}

                {/* 2. ORIGIN EDITORIAL SLIDE */}
                {slides[activeSlide].id === 'origin' && (
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center max-w-5xl mx-auto">
                    <div className="md:col-span-6 space-y-4">
                      <span className="text-[9px] font-bold text-brand-clay-dark uppercase bg-orange-100 border border-orange-200 px-2.5 py-1 rounded-md">
                        Nossa Gênese
                      </span>
                      <h2 className="text-3xl sm:text-4xl font-serif font-bold text-brand-navy tracking-tight leading-tight">
                        Fortalecer e crescer <span className="font-script text-brand-clay text-4xl block">juntos em saúde mental</span>
                      </h2>
                      <p className="text-xs text-brand-navy-light leading-relaxed">
                        O Espalhe Melodias surgiu do profundo compromisso ético de conectar terapeutas e aproximar caminhos sadios de escuta. Acreditamos que a saúde mental não deve ser construída em solidão ou competição egoica, mas como uma sinfonia coletiva de presenças sintonizadas.
                      </p>
                      <div className="p-3 bg-brand-sand/25 border-l-4 border-[#5a6242] rounded-r-xl">
                        <p className="text-[11px] text-slate-600 italic">
                          "Cada melodia de cuidado só se torna verdadeiramente livre e potente quando reverbera em harmonia com outros saberes."
                        </p>
                      </div>
                    </div>

                    <div className="md:col-span-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="p-4 bg-white rounded-2xl border border-brand-sand/75 space-y-2">
                        <div className="w-8 h-8 rounded-lg bg-olive-50 text-[#5a6242] flex items-center justify-center">
                          <Users className="w-5 h-5" />
                        </div>
                        <p className="text-xs font-bold text-brand-navy">Presença Ativa</p>
                        <p className="text-[10px] text-slate-550 leading-relaxed">Promover conexões reais que ultrapassem os limites herméticos das clínicas tradicionais.</p>
                      </div>

                      <div className="p-4 bg-white rounded-2xl border border-brand-sand/75 space-y-2">
                        <div className="w-8 h-8 rounded-lg bg-orange-50 text-brand-clay flex items-center justify-center">
                          <ShieldCheck className="w-5 h-5" />
                        </div>
                        <p className="text-xs font-bold text-brand-navy">Cuidado Seguro</p>
                        <p className="text-[10px] text-slate-550 leading-relaxed">Oferecer triagens de urgência e um diretório transparente de profissionais certificados.</p>
                      </div>

                      <div className="p-4 bg-white rounded-2xl border border-brand-sand/75 space-y-2">
                        <div className="w-8 h-8 rounded-lg bg-blue-50 text-sky-700 flex items-center justify-center">
                          <Brain className="w-5 h-5" />
                        </div>
                        <p className="text-xs font-bold text-brand-navy">Crescimento Intelectual</p>
                        <p className="text-[10px] text-slate-550 leading-relaxed">Troca de ensinamentos clínicos, materiais éticos e resoluções de desafios coletivos.</p>
                      </div>

                      <div className="p-4 bg-white rounded-2xl border border-brand-sand/75 space-y-2">
                        <div className="w-8 h-8 rounded-lg bg-pink-50 text-pink-700 flex items-center justify-center">
                          <Heart className="w-5 h-5" />
                        </div>
                        <p className="text-xs font-bold text-brand-navy">Canto De Apoio</p>
                        <p className="text-[10px] text-slate-550 leading-relaxed">Prover redes de sustentabilidade emocional contra o esgotamento extremo dos atendimentos.</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* 3. PROPÓSITO, VISÃO, VALORES (PILARES DETALHADOS) */}
                {slides[activeSlide].id === 'purpose' && (
                  <div className="max-w-5xl mx-auto space-y-6">
                    <div className="text-center space-y-1 mb-2">
                      <h2 className="text-2xl sm:text-3xl font-serif font-bold text-brand-navy tracking-tight">Catedral de Valores e Missão</h2>
                      <p className="text-xs text-brand-navy-light leading-none">O alinhamento filosófico profundo que rege todas as conexões da nossa plataforma</p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                      
                      {/* Propósito */}
                      <div className="p-5 bg-white border border-brand-sand rounded-2xl space-y-3 relative group overflow-hidden">
                        <span className="absolute -top-6 -right-6 w-14 h-14 bg-brand-sand/50 rounded-full group-hover:scale-125 transition-all"></span>
                        <div className="w-8 h-8 rounded-full bg-[#5a6242]/10 text-[#5a6242] flex items-center justify-center font-bold text-xs">01</div>
                        <p className="text-xs font-bold text-brand-navy uppercase tracking-wider">Nosso Propósito</p>
                        <p className="text-[11px] text-slate-650 leading-relaxed">
                          Fortalecer conexões profundas e éticas entre profissionais de saúde e psicologia, construindo um ecossistema seguro de troca mútua de experiências e indicação.
                        </p>
                      </div>

                      {/* Visão */}
                      <div className="p-5 bg-white border border-brand-sand rounded-2xl space-y-3 relative group overflow-hidden">
                        <span className="absolute -top-6 -right-6 w-14 h-14 bg-brand-sand/50 rounded-full group-hover:scale-125 transition-all"></span>
                        <div className="w-8 h-8 rounded-full bg-brand-clay/10 text-brand-clay flex items-center justify-center font-bold text-xs">02</div>
                        <p className="text-xs font-bold text-brand-navy uppercase tracking-wider">Nossa Visão</p>
                        <p className="text-[11px] text-slate-650 leading-relaxed">
                          Ser a maior rede de amparo multidisciplinar de psicologia interiorana, rompendo o isolamento profissional através de soluções digitais lúdicas e éticas.
                        </p>
                      </div>

                      {/* Valores */}
                      <div className="p-5 bg-white border border-brand-sand rounded-2xl space-y-3 relative group overflow-hidden">
                        <span className="absolute -top-6 -right-6 w-14 h-14 bg-brand-sand/50 rounded-full group-hover:scale-125 transition-all"></span>
                        <div className="w-8 h-8 rounded-full bg-sky-100 text-sky-800 flex items-center justify-center font-bold text-xs">03</div>
                        <p className="text-xs font-bold text-brand-navy uppercase tracking-wider">Nossos Valores</p>
                        <div className="flex flex-wrap gap-1">
                          {['Ética', 'Acolhimento', 'Presença', 'Escuta Sincera', 'Cooperação', 'Respeito', 'Humanidade'].map(v => (
                            <span key={v} className="bg-brand-sand/50 text-slate-700 text-[9px] font-semibold px-2 py-0.5 rounded-md">
                              ✦ {v}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Objetivos */}
                      <div className="p-5 bg-white border border-brand-sand rounded-2xl space-y-3 relative group overflow-hidden">
                        <span className="absolute -top-6 -right-6 w-14 h-14 bg-brand-sand/50 rounded-full group-hover:scale-125 transition-all"></span>
                        <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-xs">04</div>
                        <p className="text-xs font-bold text-brand-navy uppercase tracking-wider">Ganhos Reais</p>
                        <ul className="text-[10px] text-slate-650 leading-relaxed list-disc list-inside space-y-1">
                          <li>Troca transparente de ensinos</li>
                          <li>Integração de abordagens</li>
                          <li>Prevenção de burnout clínico</li>
                          <li>Sinergia de parcerias e projetos</li>
                        </ul>
                      </div>

                    </div>
                  </div>
                )}

                {/* 4. O QUE NOS FAZ REUNIR (CHALLENGES CARD LIST) */}
                {slides[activeSlide].id === 'why-meet' && (
                  <div className="max-w-4xl mx-auto space-y-5">
                    <div className="text-center space-y-1 max-w-xl mx-auto">
                      <span className="text-[9px] font-bold uppercase tracking-wider text-brand-clay">Motivações do Coletivo</span>
                      <h2 className="text-2xl sm:text-3xl font-serif font-bold text-brand-navy tracking-tight">O que nos motiva a estarmos aqui?</h2>
                      <p className="text-xs text-brand-navy-light leading-tight">As dores reais enfrentadas pela nossa classe e a resposta oferecida pela Estação Espalhe Melodias.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      
                      {/* Card 1 */}
                      <div className="p-5 bg-white border border-brand-sand/80 shadow-sm rounded-2xl space-y-3 flex flex-col justify-between">
                        <div className="space-y-2">
                          <p className="text-xs font-bold text-slate-750 inline-block bg-orange-100/70 text-orange-850 px-2.5 py-0.5 rounded-full">
                            🚫 Tendência ao Isolamento
                          </p>
                          <h4 className="text-xs font-bold text-brand-navy">A solidão das quatro paredes</h4>
                          <p className="text-[10px] text-slate-550 leading-relaxed">
                            O trabalho em consultório costuma isolar o clínico de feedbacks sinceros e do calor humano cotidiano da comunidade corporativa tradicional.
                          </p>
                        </div>
                        <div className="pt-3 border-t border-brand-sand/35 text-[10px] font-bold text-[#5a6242] flex items-center">
                          <Check className="w-3.5 h-3.5 mr-1 text-[#5a6242]" /> Ponto de Encontro Mensal
                        </div>
                      </div>

                      {/* Card 2 */}
                      <div className="p-5 bg-white border border-brand-sand/80 shadow-sm rounded-2xl space-y-3 flex flex-col justify-between">
                        <div className="space-y-2">
                          <p className="text-xs font-bold text-slate-750 inline-block bg-rose-100/70 text-rose-850 px-2.5 py-0.5 rounded-full">
                            🚫 Sobrecarga e Estresse
                          </p>
                          <h4 className="text-xs font-bold text-brand-navy">O perigo do esgotamento profundo</h4>
                          <p className="text-[10px] text-slate-550 leading-relaxed">
                            Ouvir dezenas de relatos traumáticos semanalmente sem uma rede madura de apoio profissional adoece o sistema nervoso autônomo do psicólogo.
                          </p>
                        </div>
                        <div className="pt-3 border-t border-brand-sand/35 text-[10px] font-bold text-[#5a6242] flex items-center">
                          <Check className="w-3.5 h-3.5 mr-1 text-[#5a6242]" /> Rede Solidária e Rodas
                        </div>
                      </div>

                      {/* Card 3 */}
                      <div className="p-5 bg-white border border-brand-sand/80 shadow-sm rounded-2xl space-y-3 flex flex-col justify-between">
                        <div className="space-y-2">
                          <p className="text-xs font-bold text-slate-750 inline-block bg-emerald-100/70 text-emerald-850 px-2.5 py-0.5 rounded-full">
                            🚫 Concorrência Fria
                          </p>
                          <h4 className="text-xs font-bold text-brand-navy">O mercado hostil e desconfianças</h4>
                          <p className="text-[10px] text-slate-550 leading-relaxed">
                            A solidão mercadológica induz a enxergar outros psicoterapeutas como rivais comerciais, minando indicações e parcerias em congressos.
                          </p>
                        </div>
                        <div className="pt-3 border-t border-brand-sand/35 text-[10px] font-bold text-[#5a6242] flex items-center">
                          <Check className="w-3.5 h-3.5 mr-1 text-[#5a6242]" /> Sinergia Coletiva Ética
                        </div>
                      </div>

                    </div>
                  </div>
                )}

                {/* 5. DINÂMICA DE CONEXÃO (INTERACTIVE GEOMETRIC NODE GRID) */}
                {slides[activeSlide].id === 'connection-flow' && (
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center max-w-5xl mx-auto py-2">
                    
                    {/* Circle diagram on Left */}
                    <div className="md:col-span-5 flex flex-col items-center justify-center relative">
                      
                      <div className="w-48 h-48 sm:w-56 sm:h-56 rounded-full border-2 border-dashed border-brand-clay/30 flex items-center justify-center relative bg-white/40">
                        {/* Central heart icon mimicking Slide 2 */}
                        <div className="w-16 h-16 rounded-full bg-brand-clay/15 flex items-center justify-center border border-brand-clay/35 animate-pulse-slow">
                          <Heart className="w-8 h-8 text-brand-clay fill-brand-clay-light/20" />
                        </div>

                        {/* Connection points surrounding the heart */}
                        {Object.keys(connectionsMap).map((key, i) => {
                          const angle = (i * 2 * Math.PI) / 5;
                          const radius = 90; // offset radius
                          const x = radius * Math.cos(angle);
                          const y = radius * Math.sin(angle);
                          const isSelected = selectedConnectionKey === key;
                          
                          return (
                            <button
                              key={key}
                              onClick={() => setSelectedConnectionKey(key)}
                              className={`absolute w-8 h-8 rounded-full border flex items-center justify-center text-xs font-bold font-mono transition-all shadow-md cursor-pointer ${
                                isSelected 
                                  ? 'bg-brand-clay text-white border-transparent scale-110 z-10' 
                                  : 'bg-white text-brand-navy border-brand-sand hover:bg-brand-sand/50'
                              }`}
                              style={{
                                transform: `translate(${x}px, ${y}px)`
                              }}
                              title={connectionsMap[key as keyof typeof connectionsMap].title}
                            >
                              {i + 1}
                            </button>
                          );
                        })}
                      </div>

                      <span className="text-[10px] font-bold text-slate-400 mt-4 text-center">Clique nos números da ciranda para interagir</span>
                    </div>

                    {/* Node details details on Right */}
                    <div className="md:col-span-7 space-y-4">
                      <span className="text-[9px] font-bold uppercase tracking-widest text-[#5a6242] bg-[#5a6242]/10 px-3 py-1 rounded-full">
                        Sabor Do Cuidado Integrado
                      </span>
                      
                      {selectedConnectionKey && connectionsMap[selectedConnectionKey as keyof typeof connectionsMap] ? (
                        <div className="p-6 bg-white border border-brand-sand/80 rounded-2xl shadow-sm space-y-3 animate-scaleUp">
                          <span className="text-[10px] font-bold text-brand-clay uppercase tracking-wider block">
                            🔑 NOTA {Object.keys(connectionsMap).indexOf(selectedConnectionKey) + 1} DE CONEXÃO
                          </span>
                          <h3 className="text-lg font-serif font-black text-brand-navy">
                            {connectionsMap[selectedConnectionKey as keyof typeof connectionsMap].title}
                          </h3>
                          <span className="inline-block bg-brand-sand/70 text-slate-700 text-[10px] font-bold px-3 py-1 rounded-full border border-brand-sand/55">
                            {connectionsMap[selectedConnectionKey as keyof typeof connectionsMap].badge}
                          </span>
                          <p className="text-xs text-slate-550 leading-relaxed leading-6 font-sans">
                            {connectionsMap[selectedConnectionKey as keyof typeof connectionsMap].desc}
                          </p>
                          <div className="pt-2 flex items-center space-x-1 text-[11px] text-[#5a6242] font-semibold">
                            <Sparkle className="w-3.5 h-3.5" />
                            <span>"Construindo um canal de escuta livre de barreiras e ruídos."</span>
                          </div>
                        </div>
                      ) : (
                        <div className="p-6 bg-slate-50 border border-brand-sand rounded-xl text-center">
                          <p className="text-xs text-slate-400">Por favor, acesse um dos pilares do círculo de sintonia terapêutica ao lado para ler seu propósito.</p>
                        </div>
                      )}
                    </div>

                  </div>
                )}

                {/* 6. SABOTADORES DA CONSTRUÇÃO (INTERACTIVE CARD BOARD) */}
                {slides[activeSlide].id === 'saboteurs' && (
                  <div className="max-w-5xl mx-auto space-y-3.5 py-1">
                    <div className="text-center space-y-1">
                      <h2 className="text-xl sm:text-2xl font-serif font-bold text-brand-navy tracking-tight">Sabotadores de Conexão Críticos</h2>
                      <p className="text-xs text-brand-navy-light leading-tight">Mapeamento de comportamentos silenciosos que enfraquecem e dividem o ecossistema médico-terapêutico.</p>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 max-h-[290px] overflow-y-auto pr-1">
                      {sabotadoresList.map((sab) => {
                        const isRevealed = revealSaboteurId === sab.id;
                        return (
                          <div 
                            key={sab.id}
                            onClick={() => setRevealSaboteurId(isRevealed ? null : sab.id)}
                            className={`p-3 border rounded-2xl cursor-pointer transition-all flex flex-col justify-between shrink-0 min-h-[110px] text-left hover:scale-[1.01.5] ${
                              isRevealed 
                                ? 'bg-brand-moss text-white border-transparent shadow shadow-brand-moss/35' 
                                : `bg-white hover:border-brand-clay border-brand-sand/70 shadow-sm`
                            }`}
                          >
                            <div className="space-y-1.5">
                              <div className="flex justify-between items-start">
                                <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                                  isRevealed ? 'bg-amber-150 text-brand-navy' : 'bg-slate-100 text-slate-500'
                                }`}>
                                  {isRevealed ? 'REMEDIO CLÍNICO' : 'COMPORTAMENTO'}
                                </span>
                                <HelpCircle className={`w-3.5 h-3.5 ${isRevealed ? 'text-brand-cream/80' : 'text-slate-400'}`} />
                              </div>
                              <h3 className={`text-xs font-black ${isRevealed ? 'text-brand-sand' : 'text-slate-800'}`}>
                                {sab.title}
                              </h3>
                            </div>

                            {/* Back / Front state view */}
                            {isRevealed ? (
                              <p className="text-[10px] text-brand-cream font-medium line-clamp-3 leading-snug animate-fadeIn">
                                💡 <strong>Ação:</strong> {sab.remedio}
                              </p>
                            ) : (
                              <p className="text-[10px] text-slate-500 leading-snug font-sans line-clamp-2">
                                {sab.revelation}
                              </p>
                            )}

                            <span className="text-[8px] uppercase tracking-wider text-right block underline mt-1 font-bold">
                              {isRevealed ? 'Fechar' : 'Ver Remédio ✓'}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* 7. COMO NOS REUNIMOS & FUNCIONAMOS (HORIZONTAL CHRONO TIMELINE) */}
                {slides[activeSlide].id === 'how-works' && (
                  <div className="max-w-4xl mx-auto space-y-6">
                    <div className="text-center space-y-1 max-w-lg mx-auto">
                      <span className="text-[9px] font-bold text-brand-clay uppercase">Engenharia Do Nosso Pertencimento</span>
                      <h2 className="text-2xl sm:text-3xl font-serif font-bold text-brand-navy tracking-tight">Roteiro de Funcionamento Integrado</h2>
                      <p className="text-xs text-brand-navy-light leading-none">Como consagramos a dinâmica de conexão ao longo de cada jornada de meses.</p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 relative">
                      
                      {/* Step 1 */}
                      <div className="p-4 bg-white border border-brand-sand rounded-2xl relative space-y-3 shadow-sm">
                        <div className="w-7 h-7 rounded-full bg-[#5a6242] text-white flex items-center justify-center text-xs font-bold font-mono">1</div>
                        <h4 className="text-xs font-bold text-brand-navy">Plataforma de Conexão</h4>
                        <p className="text-[10px] text-slate-550 leading-relaxed font-sans">
                          Sua área interna de indicações seguras, triagem direta de casos psicoterapêuticos sensíveis e um diretório com sites públicos customizados.
                        </p>
                      </div>

                      {/* Step 2 */}
                      <div className="p-4 bg-white border border-brand-sand rounded-2xl relative space-y-3 shadow-sm">
                        <div className="w-7 h-7 rounded-full bg-brand-clay text-white flex items-center justify-center text-xs font-bold font-mono">2</div>
                        <h4 className="text-xs font-bold text-brand-navy">Encontros do Coletivo</h4>
                        <p className="text-[10px] text-slate-550 leading-relaxed font-sans">
                          Um sábado à tarde por mês reservado para rodízios presenciais de fala, café comunitário, partilha de desafios de clínica e dinâmicas lúdicas de relaxamento.
                        </p>
                      </div>

                      {/* Step 3 */}
                      <div className="p-4 bg-white border border-brand-sand rounded-2xl relative space-y-3 shadow-sm">
                        <div className="w-7 h-7 rounded-full bg-brand-navy-light text-white flex items-center justify-center text-xs font-bold font-mono">3</div>
                        <h4 className="text-xs font-bold text-brand-navy">Desenvolvimento Temático</h4>
                        <p className="text-[10px] text-slate-550 leading-relaxed font-sans">
                          Cada mês foca em um tema central de desenvolvimento (ex: autoconhecimento, fobia, luto) com apoio metodológico fornecido pelos psicólogos palestrantes.
                        </p>
                      </div>

                      {/* Step 4 */}
                      <div className="p-4 bg-white border border-brand-sand rounded-2xl relative space-y-3 shadow-sm">
                        <div className="w-7 h-7 rounded-full bg-amber-600 text-white flex items-center justify-center text-xs font-bold font-mono">4</div>
                        <h4 className="text-xs font-bold text-brand-navy">Eventos Especiais</h4>
                        <p className="text-[10px] text-slate-550 leading-relaxed font-sans">
                          Consolidação em datas históricas: **Agosto** celebraremos o Mês do Psicólogo com encontros estendidos, e **Dezembro** faremos nosso Retiro Imersivo Anual.
                        </p>
                      </div>

                    </div>
                  </div>
                )}

                {/* 8. QUEM SOMOS (IDEALIZADORAS DETAILED PROFILE SHOWCASE) */}
                {slides[activeSlide].id === 'founders' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl mx-auto py-2">
                    
                    {/* Founder 1 */}
                    <div className="bg-white border border-brand-sand rounded-2xl p-5 shadow-sm space-y-4 relative overflow-hidden flex flex-col sm:flex-row gap-4 items-start text-left">
                      <div className="relative shrink-0 mx-auto sm:mx-0">
                        <img 
                          src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=200&auto=format&fit=crop" 
                          alt="Dra. Jéssica Muhamed"
                          className="w-24 h-24 rounded-2xl object-cover border-2 border-brand-sand"
                        />
                        <div className="absolute -bottom-1 -right-1 bg-[#5a6242] text-white p-1 rounded-full">
                          <Check className="w-3 h-3 stroke-[3]" />
                        </div>
                      </div>

                      <div className="space-y-2 flex-1">
                        <div>
                          <span className="text-[9px] font-bold text-[#5a6242] bg-[#5a6242]/10 px-2 py-0.5 rounded-full uppercase">
                            Idealizadora Espalhe Psicologia
                          </span>
                          <h3 className="text-base font-serif font-black text-brand-navy leading-tight mt-1">JÉSSICA MUHAMED</h3>
                          <span className="text-[9px] font-bold text-slate-400 font-mono">CRP CLÍNICA DESDE 2016</span>
                        </div>

                        <ul className="text-[10px] text-slate-550 space-y-1 pl-3 list-disc">
                          <li>Clínica há mais de 10 anos auxiliando reestruturações</li>
                          <li>Fundadora do Meraki – Espaço Multi de Saúde</li>
                          <li>Psicóloga credenciada do CAPS II de Tatuí (Pelo SUS)</li>
                          <li>Proponente de ações solidárias amplamente sintonizadas</li>
                        </ul>

                        <p className="text-[10px] font-script text-brand-clay font-medium italic border-t border-brand-sand/50 pt-2 leading-relaxed">
                          "Eu acredito verdadeiramente que ninguém constrói um cuidado forte e duradouro sozinho."
                        </p>
                      </div>
                    </div>

                    {/* Founder 2 */}
                    <div className="bg-white border border-brand-sand rounded-2xl p-5 shadow-sm space-y-4 relative overflow-hidden flex flex-col sm:flex-row gap-4 items-start text-left">
                      <div className="relative shrink-0 mx-auto sm:mx-0">
                        <img 
                          src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=200&auto=format&fit=crop" 
                          alt="Psic. Karen Gomes"
                          className="w-24 h-24 rounded-2xl object-cover border-2 border-brand-sand"
                        />
                        <div className="absolute -bottom-1 -right-1 bg-brand-clay text-white p-1 rounded-full">
                          <Check className="w-3 h-3 stroke-[3]" />
                        </div>
                      </div>

                      <div className="space-y-2 flex-1">
                        <div>
                          <span className="text-[9px] font-bold text-brand-clay bg-orange-100 px-2 py-0.5 rounded-full uppercase">
                            Idealizadora Melodias Conexões
                          </span>
                          <h3 className="text-base font-serif font-black text-brand-navy leading-tight mt-1">KAREN GOMES</h3>
                          <span className="text-[9px] font-bold text-slate-400 font-mono">CRP CLÍNICA DESDE 2021</span>
                        </div>

                        <ul className="text-[10px] text-slate-550 space-y-1 pl-3 list-disc">
                          <li>Especializada em dinâmica familiar e pertencimentos sadios</li>
                          <li>Empreendedora fundadora da Develoi Soluções Digitais</li>
                          <li>Cofundadora e coordenadora comunitária do MFC de Tatuí</li>
                          <li>Iniciadora da plataforma central de backup em tempo real</li>
                        </ul>

                        <p className="text-[10px] font-script text-brand-moss-light font-medium italic border-t border-brand-sand/50 pt-2 leading-relaxed">
                          "Conexões verdadeiras e transparentes entre familiares e profissionais fortalecem o cuidado."
                        </p>
                      </div>
                    </div>

                  </div>
                )}

                {/* 9. INTERACTIVE FORUM QUESTION FEEDBACK NOTES */}
                {slides[activeSlide].id === 'feedback-interactive' && (
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-6 max-w-5xl mx-auto py-1 items-start text-left">
                    
                    {/* Forms to add a response note */}
                    <div className="md:col-span-5 bg-white p-4 border border-brand-sand rounded-2xl shadow-sm space-y-3.5">
                      <h4 className="text-xs font-bold text-brand-navy flex items-center">
                        <MessageSquare className="w-4 h-4 text-brand-clay mr-1.5" /> Enviar Sua Voz de Psicólogo
                      </h4>
                      
                      {submitSuccess ? (
                        <div className="p-4 bg-emerald-50 text-emerald-800 rounded-xl text-center space-y-1 animate-scaleUp">
                          <p className="text-xs font-bold">✓ Voz Sincronizada com Sucesso!</p>
                          <p className="text-[10px] text-emerald-600">Sua nota foi afixada no painel de ressonância comunitária ao lado.</p>
                        </div>
                      ) : (
                        <form onSubmit={submitFeedbackForm} className="space-y-2.5">
                          <div>
                            <label className="text-[9px] font-bold text-brand-navy-light uppercase tracking-wider block mb-1">
                              1. O que achou de nossa plataforma / encontro?
                            </label>
                            <input 
                              type="text"
                              required
                              placeholder="Ex: Fantástica e extremamente necessária"
                              value={formQ1}
                              onChange={(e) => setFormQ1(e.target.value)}
                              className="w-full text-xs text-slate-700 bg-brand-cream border border-brand-sand p-2 rounded-xl focus:outline-none"
                            />
                          </div>

                          <div>
                            <label className="text-[9px] font-bold text-brand-navy-light uppercase tracking-wider block mb-1">
                              2. Qual a sua maior necessidade profissional na psicologia?
                            </label>
                            <input 
                              type="text"
                              required
                              placeholder="Ex: Indicações seguras de pacientes"
                              value={formQ2}
                              onChange={(e) => setFormQ2(e.target.value)}
                              className="w-full text-xs text-slate-700 bg-brand-cream border border-brand-sand p-2 rounded-xl focus:outline-none"
                            />
                          </div>

                          <div>
                            <label className="text-[9px] font-bold text-brand-navy-light uppercase tracking-wider block mb-1">
                              3. Que tipo de ajuda você poderia oferecer ao grupo?
                            </label>
                            <input 
                              type="text"
                              required
                              placeholder="Ex: Experiência com psicossomática"
                              value={formQ3}
                              onChange={(e) => setFormQ3(e.target.value)}
                              className="w-full text-xs text-slate-700 bg-brand-cream border border-brand-sand p-2 rounded-xl focus:outline-none"
                            />
                          </div>

                          <div className="grid grid-cols-2 gap-2">
                            <div>
                              <label className="text-[9px] font-bold text-brand-navy bg-white uppercase block mb-1">Seu Nome / CRP</label>
                              <input 
                                type="text"
                                placeholder="Dra. Mariana"
                                value={formAuthor}
                                onChange={(e) => setFormAuthor(e.target.value)}
                                className="w-full text-xs text-[#182638] bg-brand-cream p-2 border border-brand-sand rounded-xl focus:outline-none"
                              />
                            </div>
                            <button
                              type="submit"
                              className="p-2 self-end text-white font-bold text-[10px] uppercase tracking-wider bg-[#5a6242] hover:bg-[#3f452e] rounded-xl flex items-center justify-center space-x-1 cursor-pointer"
                            >
                              <span>Afixar Nota</span>
                            </button>
                          </div>
                        </form>
                      )}
                    </div>

                    {/* Infinite post-it note boards */}
                    <div className="md:col-span-7 space-y-2.5">
                      <span className="text-[9px] font-bold uppercase tracking-widest text-slate-400">Ressonância do Encontro</span>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[240px] overflow-y-auto pr-1">
                        {feedbackNotes.map((note) => (
                          <div 
                            key={note.id}
                            className={`p-3 border rounded-2xl shadow-sm space-y-1.5 ${note.color} relative overflow-hidden`}
                          >
                            <div className="flex justify-between items-center border-b border-brand-navy/10 pb-1">
                              <span className="text-[8px] font-bold uppercase tracking-wider text-brand-navy">
                                Voz de: {note.authorName}
                              </span>
                              <span className="text-[8px] text-slate-400 font-mono">{note.createdAt}</span>
                            </div>

                            <p className="text-[10px] text-slate-700 leading-snug">
                              🎯 <strong>Opinião:</strong> "{note.question1}"
                            </p>
                            <p className="text-[10px] text-slate-700 leading-snug">
                              🛠️ <strong>Necessidade:</strong> "{note.question2}"
                            </p>
                            <p className="text-[10px] text-slate-700 leading-snug">
                              🤝 <strong>Oferece:</strong> "{note.question3}"
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>

                  </div>
                )}

              </div>

              {/* Bottom Quick Indicator Panel */}
              <div className="pt-2 border-t border-brand-sand/35 flex justify-between items-center text-[10px] text-slate-400 font-bold shrink-0">
                <span className="flex items-center">
                  <Sparkle className="w-4 h-4 text-brand-clay mr-1 fill-brand-clay-light/50" />
                  <span>Sinfonia Comunitária Espalhe Melodias</span>
                </span>
                <span className="font-mono">
                  {(activeSlide + 1).toString().padStart(2, '0')} / {slides.length}
                </span>
              </div>

            </motion.div>
          </AnimatePresence>

        </div>

        {/* Slide Carousel Dots and Indicators */}
        <div className="absolute bottom-4 left-0 right-0 flex justify-center items-center space-x-1.5 z-20 select-none">
          {slides.map((slide, i) => (
            <button
              key={slide.id}
              onClick={() => setActiveSlide(i)}
              className={`w-2.5 h-2.5 rounded-full transition-all duration-300 border cursor-pointer ${
                activeSlide === i 
                  ? 'bg-brand-clay border-transparent scale-125' 
                  : 'bg-brand-sand/60 border-brand-sand hover:bg-brand-sand'
              }`}
              title={slide.title}
            ></button>
          ))}
        </div>

      </div>

      {/* QUICK SECTION EXPLAINER BENTO STATS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        <div className="bg-white border border-brand-sand/85 p-5 rounded-3xl space-y-2.5 shadow-sm text-left">
          <div className="w-9 h-9 bg-orange-100 text-[#a75a35] rounded-xl flex items-center justify-center">
            <TrendingUp className="w-5 h-5" />
          </div>
          <h4 className="text-sm font-serif font-bold text-brand-navy">Rede em Expansão</h4>
          <p className="text-xs text-brand-navy-light leading-relaxed">
            Consolidamos mais de 45 participantes no último encontro gravado, expandindo o diretório de terapeutas de braços abertos a novos cadastros de colegas locais.
          </p>
        </div>

        <div className="bg-white border border-brand-sand/85 p-5 rounded-3xl space-y-2.5 shadow-sm text-left">
          <div className="w-9 h-9 bg-olive-100 text-[#5a6242] rounded-xl flex items-center justify-center">
            <Award className="w-5 h-5" />
          </div>
          <h4 className="text-sm font-serif font-bold text-brand-navy">Garantia Ética</h4>
          <p className="text-xs text-brand-navy-light leading-relaxed">
            Nossos projetos e canais respeitam as normativas técnicas e científicas do CRP, garantindo sigilo absoluto, indicações sadias e respeito às singularidades humanas.
          </p>
        </div>

        <div className="bg-white border border-brand-sand/85 p-5 rounded-3xl space-y-2.5 shadow-sm text-left">
          <div className="w-9 h-9 bg-blue-100 text-sky-700 rounded-xl flex items-center justify-center">
            <Calendar className="w-5 h-5" />
          </div>
          <h4 className="text-sm font-serif font-bold text-brand-navy">Agenda Consolidada</h4>
          <p className="text-xs text-brand-navy-light leading-relaxed">
            Com encontros presenciais um sábado por mês, preenchemos o cronograma anual com palestras imersivas, trocas de literatura clínica e partilhas lúdicas integradas.
          </p>
        </div>

      </div>

    </div>
    </PageWrapper>
  );
}
