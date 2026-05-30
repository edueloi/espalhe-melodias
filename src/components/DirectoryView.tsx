import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Search, 
  Star, 
  MapPin, 
  CheckCircle, 
  CornerDownLeft, 
  MessageSquare, 
  CalendarDays, 
  Coins, 
  Sparkles,
  ArrowLeft,
  ChevronRight,
  ShieldCheck,
  Check,
  Globe,
  Settings,
  Plus,
  Trash2,
  Sliders,
  Sparkle,
  Music,
  Share2
} from 'lucide-react';
import { ProfessionalProfile, AppUser } from '../types';

interface DirectoryViewProps {
  professionals: ProfessionalProfile[];
  currentUser: AppUser;
  onUpdateProfessional: (updatedProf: ProfessionalProfile) => void;
}

export default function DirectoryView({ 
  professionals, 
  currentUser,
  onUpdateProfessional
}: DirectoryViewProps) {
  const [activeTab, setActiveTab] = useState<'directory' | 'edit-profile' | 'public-site'>('directory');
  const [selectedProfId, setSelectedProfId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSpecialty, setSelectedSpecialty] = useState<string>('all');
  
  // States for session booking simulation
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string>('');
  const [patientMessage, setPatientMessage] = useState('');
  const [bookSuccess, setBookSuccess] = useState(false);

  // Edit / Creation form stepper states
  const [formStep, setFormStep] = useState<number>(1);
  const [formSuccess, setFormSuccess] = useState<boolean>(false);

  // Professional form fields state
  const [profName, setProfName] = useState('');
  const [profCrp, setProfCrp] = useState('');
  const [profBio, setProfBio] = useState('');
  const [profPrice, setProfPrice] = useState(130);
  const [profLocation, setProfLocation] = useState('');
  const [profWhatsapp, setProfWhatsapp] = useState('');
  const [profAccentColor, setProfAccentColor] = useState('#a75a35'); // Default terracotta clay
  const [profAvatar, setProfAvatar] = useState('https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=200&auto=format&fit=crop');
  const [profSpecialties, setProfSpecialties] = useState<string[]>(['Ansiedade', 'Autoconhecimento']);
  const [profServices, setProfServices] = useState<string[]>([
    'Psicoterapia Individual (Online)',
    'Acompanhamento de Transtornos de Humor'
  ]);
  const [newServiceInput, setNewServiceInput] = useState('');

  // Preloaded beautiful matching professional avatars for clicking
  const avatarPresets = [
    'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?q=80&w=200&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1622253692010-333f2da6031d?q=80&w=200&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=200&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1551836022-d5d88e9218df?q=80&w=200&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=200&auto=format&fit=crop'
  ];

  const specialtiesPresetList = ['Ansiedade', 'Depressão', 'Burnout', 'Stress Ocupacional', 'Autoconhecimento', 'TCC', 'Mindfulness', 'Autoestima', 'Transtorno Pânico'];

  // Sync profile values if user is a professional or we change user
  useEffect(() => {
    // Look for professional belonging to active logged-in user simulation
    const ownProf = professionals.find(p => p.userId === currentUser.id);
    if (ownProf) {
      setProfName(ownProf.name);
      setProfCrp(ownProf.crp);
      setProfBio(ownProf.bio);
      setProfPrice(ownProf.pricePerSession);
      setProfLocation(ownProf.location);
      setProfWhatsapp(ownProf.contactWhatsapp);
      setProfAccentColor(ownProf.accentColor);
      setProfAvatar(ownProf.avatar);
      setProfSpecialties(ownProf.specialties);
      setProfServices(ownProf.services);
    } else {
      // Fallback baseline for creating new profiles (even members can try this out!)
      setProfName(currentUser.name);
      setProfCrp('CRP 06/' + Math.floor(100000 + Math.random() * 900000));
      setProfBio('Trabalho com foco em reestruturação neurocognitiva e resgate do equilíbrio das melodias internas de cada paciente através de caminhos acolhedores e sadios.');
      setProfPrice(140);
      setProfLocation('remoto / São Paulo - SP');
      setProfWhatsapp('5511999990001');
      setProfAccentColor('#5a6242'); // Default olive green
      setProfAvatar(currentUser.avatar);
      setProfSpecialties(['Ansiedade', 'Autoconhecimento']);
      setProfServices([
        'Conversa Psicoterapêutica (Online)',
        'Workshop de Música & Equilíbrio Interno'
      ]);
    }
  }, [currentUser, professionals]);

  const allSpecialties = Array.from(
    new Set(professionals.flatMap(p => p.specialties))
  );

  const filteredProfs = professionals.filter(prof => {
    const matchesSearch = prof.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          prof.bio.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          prof.location.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSpecialty = selectedSpecialty === 'all' || prof.specialties.includes(selectedSpecialty);
    return matchesSearch && matchesSpecialty;
  });

  const activeProf = selectedProfId 
    ? professionals.find(p => p.id === selectedProfId)
    : professionals.find(p => p.userId === currentUser.id) || professionals[0];

  const handleBooking = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTimeSlot) {
      alert('Por favor, escolha um dos horários disponíveis na agenda.');
      return;
    }
    setBookSuccess(true);
    setTimeout(() => {
      setBookSuccess(false);
      setSelectedTimeSlot('');
      setPatientMessage('');
    }, 4500);
  };

  const handleToggleSpecialty = (spec: string) => {
    if (profSpecialties.includes(spec)) {
      setProfSpecialties(prev => prev.filter(s => s !== spec));
    } else {
      setProfSpecialties(prev => [...prev, spec]);
    }
  };

  const handleAddService = () => {
    if (newServiceInput.trim()) {
      setProfServices(prev => [...prev, newServiceInput.trim()]);
      setNewServiceInput('');
    }
  };

  const handleRemoveService = (index: number) => {
    setProfServices(prev => prev.filter((_, i) => i !== index));
  };

  const saveProfessionalProfileForm = (e: React.FormEvent) => {
    e.preventDefault();
    // Validate inputs
    if (!profName.trim() || !profCrp.trim() || !profBio.trim()) {
      alert('Por favor preencha todos os campos obrigatórios!');
      return;
    }

    const updatedProfile: ProfessionalProfile = {
      id: professionals.find(p => p.userId === currentUser.id)?.id || `prof-${currentUser.id}`,
      userId: currentUser.id,
      name: profName,
      avatar: profAvatar,
      crp: profCrp,
      specialties: profSpecialties,
      bio: profBio,
      pricePerSession: profPrice,
      rating: 5.0,
      reviewsCount: 1,
      contactWhatsapp: profWhatsapp,
      services: profServices,
      schedule: ['Segunda 09:00', 'Quarta 11:00', 'Quinta 16:00'],
      location: profLocation,
      accentColor: profAccentColor,
      languages: ['Português']
    };

    onUpdateProfessional(updatedProfile);
    setFormSuccess(true);
    setTimeout(() => {
      setFormSuccess(false);
      setFormStep(1);
      // Switch tab to the preview page to see results!
      setSelectedProfId(updatedProfile.id);
      setActiveTab('public-site');
    }, 1800);
  };

  return (
    <div className="space-y-8 animate-fadeIn" id="directory-component-root">
      
      {/* BRAND SUBHEADLINE WITH MUSIC PHRASING */}
      <div className="border-b border-brand-sand/60 pb-5 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <span className="text-[10px] font-bold text-brand-clay uppercase tracking-widest block mb-1">Crescimento Compartilhado</span>
          <h2 className="text-2xl md:text-3xl font-serif font-bold text-brand-navy tracking-tight">
            Diretório de Profissionais <span className="font-script text-brand-moss-light text-3xl font-normal block sm:inline-block">e Sites Individuais</span>
          </h2>
          <p className="text-xs text-brand-navy-light mt-1">
            Cada psicólogo possui um micro-site público customizado para expor sua abordagem clínica e agendar pré-consultas.
          </p>
        </div>

        {/* Dynamic Navigation Tabs */}
        <div className="flex bg-brand-sand/50 p-1 rounded-xl border border-brand-sand">
          <button
            onClick={() => { setActiveTab('directory'); setSelectedProfId(null); }}
            className={`px-4 py-2 text-xs font-bold uppercase tracking-wider rounded-lg transition-all flex items-center space-x-1.5 cursor-pointer ${
              activeTab === 'directory' ? 'bg-white text-brand-navy shadow-sm' : 'text-brand-navy-light/75 hover:text-brand-navy'
            }`}
          >
            <Users className="w-4 h-4 text-brand-moss" />
            <span>Ver Diretório</span>
          </button>
          
          <button
            onClick={() => setActiveTab('edit-profile')}
            className={`px-4 py-2 text-xs font-bold uppercase tracking-wider rounded-lg transition-all flex items-center space-x-1.5 cursor-pointer ${
              activeTab === 'edit-profile' ? 'bg-white text-brand-navy shadow-sm' : 'text-brand-navy-light/75 hover:text-brand-navy'
            }`}
          >
            <Settings className="w-4 h-4 text-brand-clay" />
            <span>Meu Perfil & Form</span>
          </button>

          <button
            onClick={() => {
              // Open default or own professional site
              const ownProf = professionals.find(p => p.userId === currentUser.id);
              if (ownProf) {
                setSelectedProfId(ownProf.id);
              } else if (professionals.length > 0) {
                setSelectedProfId(professionals[0].id);
              }
              setActiveTab('public-site');
            }}
            className={`px-4 py-2 text-xs font-bold uppercase tracking-wider rounded-lg transition-all flex items-center space-x-1.5 cursor-pointer ${
              activeTab === 'public-site' ? 'bg-white text-brand-navy shadow-sm' : 'text-brand-navy-light/75 hover:text-brand-navy'
            }`}
          >
            <Globe className="w-4 h-4 text-sky-700" />
            <span>Site Público Demo</span>
          </button>
        </div>
      </div>

      {/* ======================= TAB 1: ALL DIRECTORY VIEW ======================= */}
      {activeTab === 'directory' && (
        <div className="space-y-6">
          
          {/* Filtering panels */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            
            {/* Category selection filters */}
            <div className="flex flex-wrap items-center gap-1.5 overflow-x-auto pb-1 max-w-full">
              <button
                onClick={() => setSelectedSpecialty('all')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold tracking-wide border transition whitespace-nowrap cursor-pointer ${
                  selectedSpecialty === 'all' 
                    ? 'bg-brand-moss text-white border-transparent shadow-sm' 
                    : 'bg-white text-brand-navy border-brand-sand hover:bg-brand-sand/20'
                }`}
              >
                Todas Especialidades
              </button>
              {allSpecialties.map((spec) => (
                <button
                  key={spec}
                  onClick={() => setSelectedSpecialty(spec)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold tracking-wide border transition whitespace-nowrap cursor-pointer ${
                    selectedSpecialty === spec 
                      ? 'bg-brand-moss text-white border-transparent shadow-sm' 
                      : 'bg-white text-brand-navy border-brand-sand hover:bg-brand-sand/20'
                  }`}
                >
                  🌾 {spec}
                </button>
              ))}
            </div>

            {/* Keyword search bar */}
            <div className="relative w-full md:w-80">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                <Search className="h-4 w-4 text-brand-navy-light/50" />
              </span>
              <input
                type="text"
                placeholder="Pesquisar por nome, bio ou local..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full text-xs text-brand-navy bg-white border border-brand-sand pl-10 pr-4 py-2.5 rounded-xl focus:outline-none focus:ring-1 focus:ring-brand-moss"
              />
            </div>

          </div>

          {/* Core Grid Cards */}
          {filteredProfs.length === 0 ? (
            <div className="text-center py-16 bg-white border border-brand-sand rounded-3xl p-6">
              <p className="text-sm font-semibold text-brand-navy-light">Nenhum psicoterapeuta encontrado com os termos digitados.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {filteredProfs.map((prof) => (
                <div 
                  key={prof.id} 
                  className="bg-white border border-brand-sand/75 p-6 rounded-3xl shadow-sm hover:shadow-md hover:border-brand-clay/50 transition-all flex flex-col justify-between space-y-4"
                >
                  <div className="space-y-4">
                    
                    {/* Upper profile header block */}
                    <div className="flex items-start space-x-4">
                      <img 
                        src={prof.avatar} 
                        alt={prof.name} 
                        className="w-16 h-16 rounded-2xl object-cover border-2 border-brand-sand shadow-inner bg-stone-100 shrink-0"
                      />
                      <div className="flex-1 min-w-0 space-y-1">
                        <div className="flex items-center space-x-1.5 flex-wrap gap-y-1">
                          <h3 
                            onClick={() => { setSelectedProfId(prof.id); setActiveTab('public-site'); }}
                            className="text-base font-serif font-bold text-brand-navy hover:text-brand-clay transition truncate cursor-pointer"
                          >
                            {prof.name}
                          </h3>
                          <span className="bg-brand-sand text-brand-clay-dark text-[9px] font-bold px-1.5 py-0.5 rounded-md border border-brand-sand/55">
                            {prof.crp}
                          </span>
                        </div>

                        {/* Ratings & geographical coordinates */}
                        <div className="flex items-center space-x-2 text-[10px] text-brand-navy-light/80">
                          <div className="flex items-center text-amber-500 font-bold">
                            <Star className="w-3.5 h-3.5 fill-amber-500 mr-0.5" />
                            <span>{prof.rating}</span>
                          </div>
                          <span>·</span>
                          <span>({prof.reviewsCount} consultas)</span>
                          <span>·</span>
                          <span className="font-semibold text-brand-moss">{prof.location}</span>
                        </div>
                      </div>
                    </div>

                    {/* Bio intro quote */}
                    <p className="text-xs text-brand-navy-light line-clamp-3 leading-relaxed font-sans italic">
                      "{prof.bio}"
                    </p>

                    {/* Clinical fields tag container */}
                    <div className="flex flex-wrap gap-1">
                      {prof.specialties.map((spec, i) => (
                        <span key={i} className="bg-brand-sand/40 border border-brand-sand/50 text-slate-700 text-[10px] font-semibold px-2.5 py-0.5 rounded-full">
                          ✦ {spec}
                        </span>
                      ))}
                    </div>

                  </div>

                  {/* Pricing and Action visits */}
                  <div className="pt-4 border-t border-brand-sand/50 flex items-center justify-between">
                    <div>
                      <p className="text-[9px] text-brand-navy-light uppercase tracking-wider font-bold">Valor por sessão:</p>
                      <span className="text-sm font-bold text-brand-navy">
                        R$ {prof.pricePerSession} <span className="text-[10px] font-normal text-brand-navy-light">/ 50min</span>
                      </span>
                    </div>

                    <button
                      id={`btn-visit-site-${prof.id}`}
                      onClick={() => { setSelectedProfId(prof.id); setActiveTab('public-site'); }}
                      className="px-4 py-2 bg-brand-sand hover:bg-brand-clay text-brand-navy hover:text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-all flex items-center space-x-1 border border-brand-sand/80 hover:border-transparent cursor-pointer"
                    >
                      <span>Entrar no Site Público</span>
                      <ChevronRight className="w-4 h-4 ml-0.5" />
                    </button>
                  </div>

                </div>
              ))}
            </div>
          )}

        </div>
      )}

      {/* ======================= TAB 2: EDIT PROFILE FORM (FORMULÁRIO LINDO) ======================= */}
      {activeTab === 'edit-profile' && (
        <div className="bg-white border border-brand-sand rounded-3xl overflow-hidden shadow-md max-w-4xl mx-auto animate-fadeIn">
          
          {/* Colored Stepper Header */}
          <div className="bg-brand-sand/40 p-6 border-b border-brand-sand flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h3 className="text-lg font-serif font-bold text-brand-navy">Configurador de Identidade Profissional</h3>
              <p className="text-xs text-brand-navy-light">Crie e edite as informações que farão parte da sua página pública digital externa.</p>
            </div>
            
            {/* Stepper counters */}
            <div className="flex items-center space-x-2">
              {[1, 2, 3].map((step) => (
                <div key={step} className="flex items-center">
                  <span className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs transition-all ${
                    formStep === step 
                      ? 'bg-brand-clay text-white shadow' 
                      : formStep > step 
                        ? 'bg-brand-moss text-white' 
                        : 'bg-brand-sand text-brand-navy-light'
                  }`}>
                    {step}
                  </span>
                  {step < 3 && <span className="w-8 h-0.5 bg-brand-sand"></span>}
                </div>
              ))}
            </div>
          </div>

          <div className="p-6 md:p-8">
            {formSuccess ? (
              <div className="py-20 flex flex-col items-center justify-center text-center space-y-4 animate-scaleUp">
                <div className="w-16 h-16 rounded-full bg-brand-moss/10 text-brand-moss flex items-center justify-center animate-bounce">
                  <CheckCircle className="w-10 h-10 stroke-[2.5]" />
                </div>
                <h4 className="text-lg font-serif font-bold text-brand-navy">Perfil Criado e Configurado com Sucesso!</h4>
                <p className="text-xs text-brand-navy-light max-w-sm">Estamos compilando seu site pessoal com a harmonia que você selecionou. Redirecionando em instantes...</p>
              </div>
            ) : (
              <form onSubmit={saveProfessionalProfileForm} className="space-y-6">
                
                {/* STEP 1: DADOS CLÍNICOS */}
                {formStep === 1 && (
                  <div className="space-y-5 animate-fadeIn">
                    <h4 className="text-sm font-bold text-brand-navy flex items-center uppercase tracking-wide">
                      <Sparkle className="w-4 h-4 text-brand-clay mr-1.5" /> Passo 1: Informações de Inscrição
                    </h4>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-brand-navy-light uppercase tracking-wider block">Nome do Terapeuta *</label>
                        <input
                          type="text"
                          required
                          placeholder="Ex: Dra. Jéssica Muhamed"
                          value={profName}
                          onChange={(e) => setProfName(e.target.value)}
                          className="w-full text-xs text-brand-navy bg-brand-cream border border-brand-sand p-3 rounded-xl focus:outline-none focus:ring-1 focus:ring-brand-clay"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-brand-navy-light uppercase tracking-wider block">Cadastro CRP (Conselho Regional) *</label>
                        <input
                          type="text"
                          required
                          placeholder="Ex: CRP 06/15294-SP"
                          value={profCrp}
                          onChange={(e) => setProfCrp(e.target.value)}
                          className="w-full text-xs text-brand-navy bg-brand-cream border border-brand-sand p-3 rounded-xl focus:outline-none focus:ring-1 focus:ring-brand-clay"
                        />
                      </div>
                    </div>

                    {/* Presets of avatars with instant selector */}
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-brand-navy-light uppercase tracking-wider block">Escolha Sua Foto Profissional</label>
                      <div className="flex items-center space-x-3 flex-wrap gap-y-2">
                        <img 
                          src={profAvatar} 
                          alt="preview" 
                          className="w-14 h-14 rounded-2xl object-cover border-2 border-brand-clay shadow-sm"
                        />
                        <div className="h-8 w-px bg-brand-sand"></div>
                        {avatarPresets.map((preset, index) => (
                          <button
                            key={index}
                            type="button"
                            onClick={() => setProfAvatar(preset)}
                            className={`p-0.5 rounded-xl border-2 transition ${
                              profAvatar === preset ? 'border-brand-clay' : 'border-transparent hover:border-brand-sand'
                            }`}
                          >
                            <img src={preset} alt="preset" className="w-11 h-11 rounded-lg object-cover" />
                          </button>
                        ))}
                        <input 
                          type="text"
                          placeholder="Ou link personalizado..."
                          value={profAvatar}
                          onChange={(e) => setProfAvatar(e.target.value)}
                          className="text-[10px] text-brand-navy-light border border-brand-sand p-2 rounded-lg focus:outline-none bg-brand-cream flex-1 min-w-[200px]"
                        />
                      </div>
                    </div>

                    {/* Specialties Multi check selector */}
                    <div className="space-y-2 pt-2">
                      <label className="text-[10px] font-bold text-brand-navy-light uppercase tracking-wider block">Minhas Especialidades Principais (Selecione):</label>
                      <div className="flex flex-wrap gap-1.5">
                        {specialtiesPresetList.map((spec) => {
                          const isActive = profSpecialties.includes(spec);
                          return (
                            <button
                              key={spec}
                              type="button"
                              onClick={() => handleToggleSpecialty(spec)}
                              className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition ${
                                isActive 
                                  ? 'bg-brand-moss text-white border-transparent' 
                                  : 'bg-brand-cream text-brand-navy-light border-brand-sand hover:bg-brand-sand/30'
                              }`}
                            >
                              {isActive ? '✓ ' : ''}{spec}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Next step buttons */}
                    <div className="flex justify-end pt-5 border-t border-brand-sand/50">
                      <button
                        type="button"
                        onClick={() => setFormStep(2)}
                        className="px-5 py-2.5 bg-brand-navy hover:bg-brand-navy-light text-white text-xs font-bold uppercase tracking-wider rounded-xl transition"
                      >
                        Próximo Passo: Proposta Clínica
                      </button>
                    </div>
                  </div>
                )}

                {/* STEP 2: PROPOSTA CLÍNICA */}
                {formStep === 2 && (
                  <div className="space-y-5 animate-fadeIn">
                    <h4 className="text-sm font-bold text-brand-navy flex items-center uppercase tracking-wide">
                      <Sparkle className="w-4 h-4 text-brand-clay mr-1.5" /> Passo 2: Detalhamento de Atendimento
                    </h4>

                    {/* Bio text area */}
                    <div className="space-y-1.5">
                      <div className="flex justify-between items-center">
                        <label className="text-[10px] font-bold text-brand-navy-light uppercase tracking-wider block">Bio Introdução Clínica (Abordagem Humana) *</label>
                        <span className="text-[10px] text-slate-400">Recomendado: Descrever o que inspira você</span>
                      </div>
                      <textarea
                        required
                        placeholder="Escreva uma introdução cativante que será lida como cabeçalho do seu site público..."
                        rows={5}
                        value={profBio}
                        onChange={(e) => setProfBio(e.target.value)}
                        className="w-full text-xs text-brand-navy bg-brand-cream border border-brand-sand p-3 rounded-xl focus:outline-none focus:ring-1 focus:ring-brand-clay leading-relaxed"
                      />
                    </div>

                    {/* Services and specific checklist add */}
                    <div className="space-y-3 pt-2">
                      <label className="text-[10px] font-bold text-brand-navy-light uppercase tracking-wider block">Serviços que Ofereço na Plataforma:</label>
                      <div className="flex space-x-2">
                        <input
                          type="text"
                          placeholder="Adicionar outro serviço clínico (ex: Terapia de Casal Online)"
                          value={newServiceInput}
                          onChange={(e) => setNewServiceInput(e.target.value)}
                          onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddService())}
                          className="flex-1 text-xs text-brand-navy bg-brand-cream border border-brand-sand p-2.5 rounded-xl focus:outline-none"
                        />
                        <button
                          type="button"
                          onClick={handleAddService}
                          className="p-2.5 bg-brand-moss hover:bg-brand-moss-dark text-white rounded-xl flex items-center justify-center cursor-pointer"
                        >
                          <Plus className="w-5 h-5" />
                        </button>
                      </div>

                      {/* Dynamic list rendering */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2">
                        {profServices.map((service, index) => (
                          <div key={index} className="flex items-center justify-between p-2.5 bg-brand-sand/35 border border-brand-sand rounded-xl text-xs text-brand-navy font-medium">
                            <span className="truncate mr-4 flex items-center">✓ {service}</span>
                            <button
                              type="button"
                              onClick={() => handleRemoveService(index)}
                              className="text-slate-400 hover:text-rose-600 transition"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Price session */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 pt-2">
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-brand-navy-light uppercase tracking-wider block">Valor Estimado por Consulta (R$)</label>
                        <div className="flex items-center space-x-3">
                          <input 
                            type="range"
                            min={80}
                            max={250}
                            step={10}
                            value={profPrice}
                            onChange={(e) => setProfPrice(Number(e.target.value))}
                            className="flex-1 accent-brand-clay"
                          />
                          <span className="text-sm font-bold text-brand-navy shrink-0 bg-brand-sand px-3 py-1 rounded-lg">R$ {profPrice}</span>
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-brand-navy-light uppercase tracking-wider block">Disponibilidade / Região</label>
                        <input
                          type="text"
                          placeholder="Ex: remoto / Rio de Janeiro - RJ"
                          value={profLocation}
                          onChange={(e) => setProfLocation(e.target.value)}
                          className="w-full text-xs text-brand-navy bg-brand-cream border border-brand-sand p-3 rounded-xl focus:outline-none"
                        />
                      </div>
                    </div>

                    {/* Stepper buttons */}
                    <div className="flex justify-between pt-5 border-t border-brand-sand/50">
                      <button
                        type="button"
                        onClick={() => setFormStep(1)}
                        className="px-4 py-2.5 bg-brand-cream hover:bg-brand-sand border border-brand-sand rounded-xl text-xs font-bold text-brand-navy uppercase transition"
                      >
                        Voltar
                      </button>
                      <button
                        type="button"
                        onClick={() => setFormStep(3)}
                        className="px-5 py-2.5 bg-brand-navy hover:bg-brand-navy-light text-white text-xs font-bold uppercase tracking-wider rounded-xl transition"
                      >
                        Próximo: Identidade Visual & Redes
                      </button>
                    </div>
                  </div>
                )}

                {/* STEP 3: DESIGN DIGITAL */}
                {formStep === 3 && (
                  <div className="space-y-5 animate-fadeIn">
                    <h4 className="text-sm font-bold text-brand-navy flex items-center uppercase tracking-wide">
                      <Sparkle className="w-4 h-4 text-brand-clay mr-1.5" /> Passo 3: Identidade Visual do Site Público
                    </h4>

                    {/* Theme color Accent selectors */}
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-brand-navy-light uppercase tracking-wider block">Selecione o Tom de Equilíbrio do Seu Site:</label>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        {[
                          { color: '#a75a35', label: 'Earthy Clay', preview: 'bg-[#a75a35]' },
                          { color: '#5a6242', label: 'Forest Moss', preview: 'bg-[#5a6242]' },
                          { color: '#182638', label: 'Deep Indigo', preview: 'bg-[#182638]' },
                          { color: '#581a2e', label: 'Classic Red', preview: 'bg-[#581a2e]' }
                        ].map((choice) => (
                          <button
                            key={choice.color}
                            type="button"
                            onClick={() => setProfAccentColor(choice.color)}
                            className={`p-3 rounded-xl border flex items-center space-x-2 text-left transition-all cursor-pointer ${
                              profAccentColor === choice.color 
                                ? 'border-brand-clay bg-brand-sand/20 font-bold' 
                                : 'border-brand-sand/65 hover:bg-brand-sand/10/30'
                            }`}
                          >
                            <span className={`w-4 h-4 rounded-full ${choice.preview}`}></span>
                            <span className="text-[11px] text-brand-navy leading-none">{choice.label}</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-2">
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-brand-navy-light uppercase tracking-wider block">WhatsApp Comercial para Contato</label>
                        <input
                          type="text"
                          placeholder="Ex: 5511999990001 (Somente números)"
                          value={profWhatsapp}
                          onChange={(e) => setProfWhatsapp(e.target.value)}
                          className="w-full text-xs text-brand-navy bg-brand-cream border border-brand-sand p-3 rounded-xl focus:outline-none focus:ring-1 focus:ring-brand-clay"
                        />
                        <span className="text-[9px] text-slate-400 block">Isso vai alimentar o botão direto de agendamento mobile do seu site público.</span>
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-brand-navy-light uppercase tracking-wider block">Idiomas Flutuantes</label>
                        <input
                          type="text"
                          placeholder="Ex: Português, Inglês"
                          defaultValue="Português"
                          className="w-full text-xs text-brand-navy bg-brand-cream border border-brand-sand p-3 rounded-xl focus:outline-none"
                        />
                      </div>
                    </div>

                    {/* Stepper controls */}
                    <div className="flex justify-between pt-5 border-t border-brand-sand/50">
                      <button
                        type="button"
                        onClick={() => setFormStep(2)}
                        className="px-4 py-2.5 bg-brand-cream hover:bg-brand-sand border border-brand-sand rounded-xl text-xs font-bold text-brand-navy uppercase transition"
                      >
                        Voltar
                      </button>
                      <button
                        type="submit"
                        className="px-5 py-2.5 bg-brand-moss hover:bg-brand-moss-dark text-white text-xs font-bold uppercase tracking-wider rounded-xl transition shadow-md"
                      >
                        Gerar Meu Perfil & Site Público 🚀
                      </button>
                    </div>
                  </div>
                )}

              </form>
            )}
          </div>

        </div>
      )}

      {/* ======================= TAB 3: PERSONAL PROFESSIONAL PUBLIC MINI SITE PREVIEW ======================= */}
      {activeTab === 'public-site' && activeProf && (
        <div className="space-y-6 animate-scaleUp" id="professional-site-wrapper">
          
          {/* Custom micro-site toolbar */}
          <div className="flex items-center justify-between bg-[#182638] text-white p-4 rounded-2xl shadow-sm border border-brand-sand">
            <div className="flex items-center space-x-2">
              <span className="w-2.5 h-2.5 rounded-full animate-pulse-slow" style={{ backgroundColor: activeProf.accentColor }}></span>
              <span className="text-[10px] font-bold uppercase tracking-widest text-brand-sand font-sans">Simulação de Website Externo Conectado</span>
            </div>
            
            <div className="flex items-center space-x-3 text-xs">
              <span className="text-slate-300 hidden sm:inline-block font-mono bg-brand-navy-dark px-3 py-1 rounded">
                https://espalhemelodias.com.br/terapeuta-{activeProf.id}
              </span>
              <button 
                onClick={() => alert(`📋 URL do site do(a) ${activeProf.name} copiada!`)}
                className="p-1 px-2.5 bg-brand-clay hover:bg-brand-clay-dark text-white rounded font-bold text-[10px] uppercase transition cursor-pointer flex items-center space-x-1"
              >
                <Share2 className="w-3 h-3" />
                <span>Copiar</span>
              </button>
            </div>
          </div>

          {/* ======================= EDITORIAL SITE CONTAINER BODY ======================= */}
          <div className="bg-[#FAF8F5] text-brand-navy-light rounded-3xl border border-brand-sand overflow-hidden shadow-xl font-sans relative">
            
            {/* Top botanical line motif */}
            <div className="h-2 w-full" style={{ backgroundColor: activeProf.accentColor }}></div>

            {/* Micro Site Navbar */}
            <nav className="px-6 md:px-12 py-4 border-b border-brand-sand/45 flex justify-between items-center bg-white/60 backdrop-blur-md sticky top-0 z-10">
              <div className="flex items-center space-x-2">
                <Music className="w-5 h-5" style={{ color: activeProf.accentColor }} />
                <span className="font-serif font-bold text-brand-navy tracking-tight text-lg">Espalhe Melodias</span>
              </div>
              <ul className="flex items-center space-x-6 text-xs font-bold text-brand-navy-light uppercase tracking-wider">
                <li className="hover:text-brand-clay duration-150"><a href="#sobre-mim">Sobre</a></li>
                <li className="hover:text-brand-clay duration-150"><a href="#servicos">Serviços</a></li>
                <li className="hover:text-brand-clay duration-150"><a href="#agendamentos">Agendamento</a></li>
              </ul>
            </nav>

            {/* Custom Brand Hero Site matching Slide designs */}
            <section className="px-6 md:px-12 py-10 md:py-16 grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
              
              {/* Profile Image & Badge */}
              <div className="md:col-span-4 flex flex-col items-center md:items-start text-center md:text-left space-y-4">
                <div className="relative">
                  <img 
                    src={activeProf.avatar} 
                    alt={activeProf.name} 
                    className="w-48 h-48 rounded-3xl object-cover shadow-xl border-4 border-white"
                  />
                  <div className="absolute -bottom-2 -right-2 bg-emerald-500 text-white p-2 rounded-full border-4 border-[#FAF8F5] shadow" title="Psicólogo Credenciado">
                    <Check className="w-4 h-4 stroke-[3px]" />
                  </div>
                </div>

                <div className="space-y-1">
                  <p className="font-serif text-lg font-bold text-brand-navy">{activeProf.name}</p>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{activeProf.crp}</p>
                </div>
              </div>

              {/* Approach clinical introduction */}
              <div className="md:col-span-8 space-y-4 text-center md:text-left">
                <span className="text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full border inline-block" style={{ color: activeProf.accentColor, borderColor: activeProf.accentColor + '40', backgroundColor: activeProf.accentColor + '10' }}>
                  Acolhimento Integrado
                </span>

                <h2 className="text-3xl md:text-4xl font-serif font-bold text-brand-navy tracking-tight leading-tight">
                  Encontrando <span className="font-script text-4xl md:text-5xl font-normal" style={{ color: activeProf.accentColor }}>o equilíbrio interno</span> na sua jornada emocional.
                </h2>

                <p className="text-xs text-brand-navy-light leading-relaxed max-w-xl italic mx-auto md:mx-0">
                  "{activeProf.bio}"
                </p>

                {/* Slides content integrated: "Nosso Propósito" */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-4 border-t border-brand-sand">
                  <div className="p-3 bg-white rounded-xl border border-brand-sand/50">
                    <p className="font-bold text-[10px] uppercase text-brand-navy">Propósito</p>
                    <p className="text-[9px] text-brand-navy-light mt-1">Conectando histórias com respeito mútuo e ciência.</p>
                  </div>
                  <div className="p-3 bg-white rounded-xl border border-brand-sand/50">
                    <p className="font-bold text-[10px] uppercase text-brand-navy">Nossa Visão</p>
                    <p className="text-[9px] text-brand-navy-light mt-1">Saúde integral de forma inclusiva e livre de barreiras.</p>
                  </div>
                  <div className="p-3 bg-white rounded-xl border border-brand-sand/50">
                    <p className="font-bold text-[10px] uppercase text-brand-navy">Princípios</p>
                    <p className="text-[9px] text-brand-navy-light mt-1">Sinfonia, presença, transparência compartilhada.</p>
                  </div>
                </div>
              </div>

            </section>

            {/* SERVICES MATRIX & PRICING SECTION */}
            <section id="servicos" className="bg-white px-6 md:px-12 py-12 border-y border-brand-sand/50">
              <div className="max-w-2xl mx-auto space-y-6 text-center">
                <h3 className="text-lg font-serif font-bold text-brand-navy">Modelos de Suporte & Sessões Clínicas</h3>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-left">
                  {activeProf.services.map((service, index) => (
                    <div key={index} className="p-4 bg-[#FAF8F5] rounded-2xl border border-brand-sand/45 flex items-start space-x-3 hover:border-brand-clay transition">
                      <span className="p-1 px-2.5 rounded-lg text-white font-bold text-xs" style={{ backgroundColor: activeProf.accentColor }}>
                        {index + 1}
                      </span>
                      <div>
                        <p className="font-bold text-xs text-brand-navy">{service}</p>
                        <p className="text-[10px] text-brand-navy-light mt-0.5">Sessão estruturada individual realizada em ambiente estrito de sigilo terapêutico.</p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="p-4 rounded-2xl border bg-brand-sand/20 flex flex-col sm:flex-row items-center justify-between gap-4 max-w-lg mx-auto">
                  <div className="flex items-center space-x-2.5 text-left">
                    <span className="p-2 bg-emerald-50 text-emerald-600 rounded-xl">
                      <Coins className="w-5 h-5" />
                    </span>
                    <div>
                      <p className="text-[9px] font-bold uppercase text-slate-400">Atendimento Particular</p>
                      <p className="text-xs font-bold text-brand-navy">R$ {activeProf.pricePerSession} <span className="font-normal text-slate-500">/ consulta de 50min</span></p>
                    </div>
                  </div>

                  <span className="text-[10px] bg-brand-sand/70 text-slate-700 px-3 py-1 rounded-lg font-bold">
                    📍 {activeProf.location}
                  </span>
                </div>
              </div>
            </section>

            {/* SCHEDULER BOARD WITH SIMULATOR ACTION */}
            <section id="agendamentos" className="px-6 md:px-12 py-10 max-w-xl mx-auto space-y-6">
              <div className="text-center space-y-1">
                <h3 className="text-lg font-serif font-bold text-brand-navy">Marcar Consulta na Agenda</h3>
                <p className="text-xs text-brand-navy-light">Selecione o horário demonstrativo abaixo e envie a solicitação imediatamente.</p>
              </div>

              {bookSuccess ? (
                <div className="p-6 bg-emerald-50 rounded-3xl border border-emerald-250 text-center space-y-3.5 animate-scaleUp">
                  <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center stroke-[2.5] mx-auto animate-bounce">
                    <Check className="w-6 h-6" />
                  </div>
                  <h4 className="font-serif font-bold text-emerald-800 text-sm">Agendamento Realizado!</h4>
                  <p className="text-xs text-emerald-700 leading-relaxed max-w-sm mx-auto">
                    A sala privativa online foi gerada e enviada para o seu e-mail de simulação. O Terapeuta <strong>{activeProf.name}</strong> confirmará a sessão assim que analisar a solicitação.
                  </p>
                  <button
                    onClick={() => { setBookSuccess(false); setSelectedTimeSlot(''); }}
                    className="px-4 py-2 bg-emerald-700 text-white rounded-lg text-xs font-bold uppercase tracking-wider hover:bg-emerald-800 transition"
                  >
                    Marcar Outro Horário
                  </button>
                </div>
              ) : (
                <form onSubmit={handleBooking} className="space-y-4 bg-white p-6 border border-brand-sand rounded-3xl shadow-sm">
                  
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-brand-navy-light uppercase tracking-wider block">1. Escolha a Agenda Disponível:</label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {activeProf.schedule.map((time, i) => (
                        <button
                          key={i}
                          type="button"
                          onClick={() => setSelectedTimeSlot(time)}
                          className={`py-2 px-3 text-xs font-bold rounded-xl border text-center transition-all ${
                            selectedTimeSlot === time
                              ? 'text-white shadow-sm border-transparent'
                              : 'bg-[#FAF8F5] text-brand-navy border-brand-sand hover:bg-brand-sand/30'
                          }`}
                          style={{ backgroundColor: selectedTimeSlot === time ? activeProf.accentColor : undefined }}
                        >
                          📅 {time}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-brand-navy-light uppercase tracking-wider block">2. Deixe uma Nota Inicial (Opcional):</label>
                    <textarea
                      placeholder="Descreva brevemente queixas principais ou sua demanda terapêutica..."
                      rows={3}
                      value={patientMessage}
                      onChange={(e) => setPatientMessage(e.target.value)}
                      className="w-full text-xs text-brand-navy bg-brand-cream border border-brand-sand/55 p-3 rounded-xl focus:outline-none focus:ring-1"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3 text-white text-xs font-bold uppercase tracking-wider rounded-xl transition hover:scale-[1.01]"
                    style={{ backgroundColor: activeProf.accentColor }}
                  >
                    Pré-reservar Consulta
                  </button>
                </form>
              )}

              {/* Whatsapp link button */}
              <div className="text-center">
                <a
                  href={`https://wa.me/${activeProf.contactWhatsapp}`}
                  target="_blank"
                  rel="noopener referrer"
                  className="inline-flex items-center space-x-2 text-xs font-bold text-emerald-600 hover:text-emerald-700 underline"
                >
                  <span>💬 Prefere conversar no WhatsApp Comercial? Falar direto</span>
                </a>
              </div>
            </section>

          </div>

        </div>
      )}

    </div>
  );
}
