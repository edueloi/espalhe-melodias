import React, { useState, useEffect } from 'react';
import { Eye, EyeOff, Lock, Mail, User, Phone, ArrowRight, CheckCircle2, AlertCircle, RefreshCw, Stethoscope, ChevronDown } from 'lucide-react';
import { inviteLinksApi, usersApi, authApi, tokenStore } from '../lib/api';
import { ApiError } from '../lib/api';

const ESPECIALIDADES = [
  { value: 'Psicólogo(a)',           label: 'Psicólogo(a)' },
  { value: 'Psicopedagogo(a)',       label: 'Psicopedagogo(a)' },
  { value: 'Pediatra',              label: 'Pediatra' },
  { value: 'Psiquiatra',            label: 'Psiquiatra' },
  { value: 'Terapeuta Ocupacional', label: 'Terapeuta Ocupacional' },
  { value: 'Médico(a)',             label: 'Médico(a)' },
  { value: 'outro',                 label: 'Outro' },
];

interface Props {
  token: string;
  onSuccess: () => void;
}

function formatWhatsapp(raw: string): string {
  const digits = raw.replace(/\D/g, '').slice(0, 11);
  if (digits.length <= 2) return digits.length ? `(${digits}` : '';
  if (digits.length <= 7) return `(${digits.slice(0,2)}) ${digits.slice(2)}`;
  return `(${digits.slice(0,2)}) ${digits.slice(2,7)}-${digits.slice(7)}`;
}

export default function InviteRegisterView({ token, onSuccess }: Props) {
  const [step, setStep] = useState<'loading' | 'invalid' | 'form' | 'saving' | 'done'>('loading');
  const [linkInfo, setLinkInfo] = useState<{ label: string; role: string; expiresAt: string } | null>(null);
  const [errorMsg, setErrorMsg] = useState('');

  const [name, setName]                   = useState('');
  const [email, setEmail]                 = useState('');
  const [password, setPassword]           = useState('');
  const [whatsapp, setWhatsapp]           = useState('');
  const [especialidade, setEspecialidade] = useState('');
  const [especialidadeCustom, setEspecialidadeCustom] = useState('');
  const [genero, setGenero]               = useState('');
  const [showPass, setShowPass]           = useState(false);
  const [fieldError, setFieldError]       = useState('');

  useEffect(() => {
    // Valida o token consultando o backend
    fetch(`http://localhost:3001/api/invite-links/info/${token}`)
      .then(r => r.json())
      .then(body => {
        if (body.success && body.data) {
          setLinkInfo(body.data);
          setStep('form');
        } else {
          setErrorMsg(body.message ?? 'Link inválido ou expirado.');
          setStep('invalid');
        }
      })
      .catch(() => {
        setErrorMsg('Não foi possível verificar o link. Tente novamente.');
        setStep('invalid');
      });
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFieldError('');
    if (!name.trim()) { setFieldError('Informe seu nome completo.'); return; }
    if (!email.trim()) { setFieldError('Informe seu e-mail.'); return; }
    if (password.length < 6) { setFieldError('A senha deve ter pelo menos 6 caracteres.'); return; }

    setStep('saving');
    try {
      // 1. Cria o usuário (aprovado automaticamente)
      const especialidadeFinal = especialidade === 'outro'
        ? especialidadeCustom.trim()
        : especialidade || undefined;

      await usersApi.create({
        name: name.trim(),
        email: email.trim(),
        password,
        role: linkInfo?.role ?? 'member',
        whatsapp: whatsapp || undefined,
        specialty: especialidadeFinal,
        gender: genero || undefined,
      });

      // 2. Faz login automaticamente
      const loginRes = await authApi.login(email.trim(), password);
      tokenStore.set(loginRes.accessToken);
      if (loginRes.refreshToken) tokenStore.setRefresh(loginRes.refreshToken);

      // 3. Registra o uso do link (ignora erro — usuário já foi criado)
      try {
        await inviteLinksApi.use(token);
      } catch { /* silencioso */ }

      setStep('done');
      setTimeout(() => onSuccess(), 2000);
    } catch (err) {
      const msg = err instanceof ApiError ? err.message : 'Erro ao criar conta. Tente novamente.';
      setFieldError(msg);
      setStep('form');
    }
  };

  const ROLE_LABEL: Record<string, string> = {
    'member':       'Membro',
    'professional': 'Editor',
    'super-admin':  'Admin',
  };

  // ── Loading ───────────────────────────────────────────────────────────────
  if (step === 'loading') {
    return (
      <div className="min-h-screen bg-brand-cream flex items-center justify-center">
        <div className="text-center space-y-3">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-brand-clay to-brand-moss flex items-center justify-center shadow-xl mx-auto">
            <span className="text-2xl text-white font-serif font-black italic">♩Ψ</span>
          </div>
          <div className="flex items-center gap-2 text-slate-500 text-sm justify-center">
            <RefreshCw size={14} className="animate-spin" />
            <span>Verificando convite...</span>
          </div>
        </div>
      </div>
    );
  }

  // ── Inválido ──────────────────────────────────────────────────────────────
  if (step === 'invalid') {
    return (
      <div className="min-h-screen bg-brand-cream flex items-center justify-center p-6">
        <div className="w-full max-w-sm">
          {/* Logo */}
          <div className="flex items-center justify-center gap-3 mb-8">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-brand-clay to-brand-moss flex items-center justify-center shadow-lg">
              <span className="text-xl text-white font-serif font-black italic">♩Ψ</span>
            </div>
            <div className="text-left">
              <div className="font-serif text-xl font-black text-brand-navy leading-none">Espalhe</div>
              <div className="font-script text-2xl text-brand-clay leading-none -mt-1">Melodias</div>
            </div>
          </div>

          {/* Card de erro */}
          <div className="bg-white rounded-3xl shadow-xl p-8 text-center">
            <div className="w-16 h-16 rounded-2xl bg-red-50 flex items-center justify-center mx-auto mb-5">
              <AlertCircle size={30} className="text-red-400" />
            </div>

            <h2 className="font-serif text-2xl font-bold text-brand-navy mb-2">
              Link indisponível
            </h2>
            <p className="text-sm text-slate-500 leading-relaxed mb-6">
              Este link de convite está expirado, foi desativado ou já atingiu o limite de inscrições.
            </p>

            <div className="bg-brand-sand/50 rounded-2xl p-4 text-left space-y-2 mb-6">
              <p className="text-xs font-bold text-brand-navy uppercase tracking-wider">O que fazer?</p>
              <p className="text-xs text-slate-500 flex items-start gap-2">
                <span className="text-brand-clay font-bold mt-0.5">1.</span>
                Peça um novo link para a pessoa que te convidou.
              </p>
              <p className="text-xs text-slate-500 flex items-start gap-2">
                <span className="text-brand-clay font-bold mt-0.5">2.</span>
                Se você já tem uma conta, acesse pelo botão abaixo.
              </p>
            </div>

            <a
              href="/login"
              className="block w-full py-3 bg-gradient-to-r from-brand-clay to-brand-clay-dark text-white font-bold text-sm rounded-xl hover:opacity-90 transition text-center shadow-lg shadow-brand-clay/20"
            >
              Acessar minha conta
            </a>
          </div>
        </div>
      </div>
    );
  }

  // ── Sucesso ───────────────────────────────────────────────────────────────
  if (step === 'done') {
    return (
      <div className="min-h-screen bg-brand-cream flex items-center justify-center p-6">
        <div className="w-full max-w-sm bg-white rounded-3xl shadow-xl p-8 text-center">
          <div className="w-14 h-14 rounded-full bg-emerald-50 flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 size={28} className="text-emerald-500" />
          </div>
          <h2 className="font-serif text-xl font-bold text-brand-navy mb-2">Bem-vindo(a)!</h2>
          <p className="text-sm text-slate-500">Sua conta foi criada com sucesso. Redirecionando para a plataforma...</p>
          <div className="flex items-center justify-center gap-2 text-slate-400 text-xs mt-4">
            <RefreshCw size={12} className="animate-spin" />entrando...
          </div>
        </div>
      </div>
    );
  }

  // ── Formulário ────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-brand-cream flex items-center justify-center p-4 sm:p-6">
      <div className="w-full max-w-md">

        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center space-x-3 mb-5">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-brand-clay to-brand-moss flex items-center justify-center shadow-lg">
              <span className="text-xl text-white font-serif font-black italic">♩Ψ</span>
            </div>
            <div className="text-left">
              <div className="font-serif text-xl font-black text-brand-navy leading-none">Espalhe</div>
              <div className="font-script text-2xl text-brand-clay leading-none -mt-1">Melodias</div>
            </div>
          </div>

          {linkInfo && (
            <div className="inline-flex items-center gap-2 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold px-3 py-1.5 rounded-full mb-4">
              <CheckCircle2 size={12} />
              Convite válido — acesso como <strong>{ROLE_LABEL[linkInfo.role] ?? linkInfo.role}</strong>
            </div>
          )}

          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-brand-navy mb-1">Criar sua conta</h1>
          <p className="text-slate-500 text-sm">
            {linkInfo?.label ? `Você foi convidado(a) via "${linkInfo.label}"` : 'Preencha os dados para acessar a plataforma.'}
          </p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-3xl shadow-xl p-6 sm:p-8">
          <form onSubmit={handleSubmit} className="space-y-4">

            {/* Nome */}
            <div>
              <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">Nome completo</label>
              <div className="relative">
                <User size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text" value={name} onChange={e => setName(e.target.value)}
                  placeholder="Seu nome completo" required
                  className="w-full pl-10 pr-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl text-sm text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-brand-clay/30 focus:border-brand-clay transition placeholder:text-slate-300"
                />
              </div>
            </div>

            {/* E-mail */}
            <div>
              <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">E-mail</label>
              <div className="relative">
                <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="email" value={email} onChange={e => setEmail(e.target.value)}
                  placeholder="seu@email.com.br" required
                  className="w-full pl-10 pr-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl text-sm text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-brand-clay/30 focus:border-brand-clay transition placeholder:text-slate-300"
                />
              </div>
            </div>

            {/* Senha */}
            <div>
              <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">Senha de acesso</label>
              <div className="relative">
                <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type={showPass ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)}
                  placeholder="Mínimo 6 caracteres" required minLength={6}
                  className="w-full pl-10 pr-11 py-3 bg-zinc-50 border border-zinc-200 rounded-xl text-sm text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-brand-clay/30 focus:border-brand-clay transition placeholder:text-slate-300"
                />
                <button type="button" onClick={() => setShowPass(v => !v)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition">
                  {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            {/* WhatsApp */}
            <div>
              <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                WhatsApp <span className="normal-case font-normal text-slate-400">(opcional)</span>
              </label>
              <div className="relative">
                <Phone size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="tel" value={whatsapp}
                  onChange={e => setWhatsapp(formatWhatsapp(e.target.value))}
                  placeholder="(00) 00000-0000"
                  className="w-full pl-10 pr-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl text-sm text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-brand-clay/30 focus:border-brand-clay transition placeholder:text-slate-300"
                />
              </div>
            </div>

            {/* Especialidade */}
            <div>
              <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                Especialidade <span className="normal-case font-normal text-slate-400">(opcional)</span>
              </label>
              <div className="relative">
                <Stethoscope size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                <select
                  value={especialidade}
                  onChange={e => { setEspecialidade(e.target.value); setEspecialidadeCustom(''); }}
                  className="w-full pl-10 pr-9 py-3 bg-zinc-50 border border-zinc-200 rounded-xl text-sm text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-brand-clay/30 focus:border-brand-clay transition appearance-none cursor-pointer"
                >
                  <option value="">Selecione...</option>
                  {ESPECIALIDADES.map(e => (
                    <option key={e.value} value={e.value}>{e.label}</option>
                  ))}
                </select>
                <ChevronDown size={13} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              </div>
            </div>

            {/* Campo livre se "Outro" */}
            {especialidade === 'outro' && (
              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">Qual especialidade?</label>
                <input
                  type="text" value={especialidadeCustom}
                  onChange={e => setEspecialidadeCustom(e.target.value)}
                  placeholder="Digite sua especialidade..."
                  className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl text-sm text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-brand-clay/30 focus:border-brand-clay transition placeholder:text-slate-300"
                />
              </div>
            )}

            {/* Gênero */}
            <div>
              <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                Gênero <span className="normal-case font-normal text-slate-400">(opcional)</span>
              </label>
              <div className="relative">
                <select
                  value={genero}
                  onChange={e => setGenero(e.target.value)}
                  className="w-full px-4 pr-9 py-3 bg-zinc-50 border border-zinc-200 rounded-xl text-sm text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-brand-clay/30 focus:border-brand-clay transition appearance-none cursor-pointer"
                >
                  <option value="">Selecione...</option>
                  <option value="nao_declarado">Não declarado</option>
                  <option value="masculino">Masculino</option>
                  <option value="feminino">Feminino</option>
                </select>
                <ChevronDown size={13} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              </div>
            </div>

            {/* Erro */}
            {fieldError && (
              <div className="flex items-start gap-2 bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-xl">
                <AlertCircle size={15} className="shrink-0 mt-0.5" />
                <span>{fieldError}</span>
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={step === 'saving'}
              className="w-full py-3.5 bg-gradient-to-r from-brand-clay to-brand-clay-dark text-white font-bold text-sm rounded-xl hover:opacity-90 transition flex items-center justify-center gap-2 shadow-lg shadow-brand-clay/25 disabled:opacity-60 mt-2"
            >
              {step === 'saving'
                ? <><RefreshCw size={15} className="animate-spin" />Criando conta...</>
                : <><span>Criar minha conta</span><ArrowRight size={15} /></>
              }
            </button>
          </form>
        </div>

        <p className="text-center text-xs text-slate-400 mt-5">
          Ao criar sua conta você concorda com os termos de uso da plataforma Espalhe Melodias.
        </p>
      </div>
    </div>
  );
}
