import React, { useState } from 'react';
import { Eye, EyeOff, Lock, Mail, ArrowRight, Globe, Users, Heart, Sprout, AlertCircle, CheckCircle2, X, Loader2 } from 'lucide-react';
import { ApiError, authApi } from '../lib/api';
import { useAuth } from '../lib/auth';
import logoEspalheMelodias from '../images/logo-espalhe-melodias.png';

function ForgotPasswordModal({ onClose }: { onClose: () => void }) {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setLoading(true);
    setError('');
    try {
      await authApi.forgotPassword(email.trim());
      setSent(true);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Erro de conexão. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-7" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-serif text-lg font-bold text-brand-navy">Esqueci minha senha</h3>
          <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-brand-clay rounded-lg transition"><X className="w-4 h-4" /></button>
        </div>

        {sent ? (
          <div className="text-center py-4">
            <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto mb-3" />
            <p className="text-sm text-slate-600 leading-relaxed">
              Se o e-mail informado estiver cadastrado, você receberá em instantes as instruções para redefinir sua senha.
            </p>
            <button onClick={onClose} className="mt-5 w-full py-2.5 bg-brand-clay hover:bg-brand-clay-dark text-white text-sm font-bold rounded-xl transition">
              Fechar
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <p className="text-sm text-slate-500 leading-relaxed">
              Informe o e-mail da sua conta. Enviaremos um link para você criar uma nova senha.
            </p>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="email" value={email} onChange={e => setEmail(e.target.value)}
                placeholder="seu@email.com.br" required autoFocus
                className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-clay/40 focus:border-brand-clay transition"
              />
            </div>
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-xl flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}
            <button type="submit" disabled={loading}
              className="w-full py-3 bg-brand-clay hover:bg-brand-clay-dark disabled:opacity-60 text-white text-sm font-bold rounded-xl transition flex items-center justify-center gap-2">
              {loading ? <><Loader2 className="w-4 h-4 animate-spin" />Enviando...</> : 'Enviar link de recuperação'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

interface LoginViewProps {
  onLoginSuccess: () => void;
  onGoToPublicSite: () => void;
}

export default function LoginView({ onLoginSuccess, onGoToPublicSite }: LoginViewProps) {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showForgotModal, setShowForgotModal] = useState(false);

  const handleSubmit = async (ev: React.FormEvent) => {
    ev.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email.trim(), password, rememberMe);
      onLoginSuccess();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Erro de conexão com o servidor.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-brand-cream flex">
      {/* Left decorative panel */}
      <div className="hidden lg:flex w-1/2 bg-brand-navy-dark flex-col items-center justify-center p-16 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 text-9xl text-brand-clay font-script">♩</div>
          <div className="absolute top-1/3 right-8 text-7xl text-brand-moss font-script">♪</div>
          <div className="absolute bottom-20 left-1/4 text-8xl text-brand-clay-light font-script">♫</div>
          <div className="absolute bottom-1/3 right-1/4 text-6xl text-brand-moss-light font-script">♬</div>
        </div>
        <div className="absolute inset-0 bg-gradient-to-br from-brand-navy-dark via-brand-navy to-[#1a2d20] opacity-90" />
        <div className="relative z-10 text-center">
          <div className="flex items-center justify-center space-x-4 mb-10">
            <img src={logoEspalheMelodias} alt="Espalhe Melodias" className="w-16 h-16 rounded-2xl object-cover shadow-2xl" />
            <div>
              <div className="font-serif text-3xl font-black text-brand-cream tracking-wide leading-none">Espalhe</div>
              <div className="font-script text-4xl text-brand-clay-light leading-none -mt-1">Melodias</div>
            </div>
          </div>
          <div className="w-16 h-0.5 bg-brand-clay/50 mx-auto mb-8" />
          <h2 className="font-serif text-3xl font-bold text-brand-cream mb-4 leading-tight">
            Conexões em<br />
            <span className="text-brand-clay-light font-script text-4xl">Saúde Mental</span>
          </h2>
          <p className="text-slate-400 text-base leading-relaxed max-w-xs mx-auto mb-12">
            Uma comunidade de profissionais que acreditam no poder das conexões para fortalecer o cuidado em saúde mental.
          </p>
          <div className="grid grid-cols-3 gap-4">
            {[{ icon: Users, label: 'Conexões Reais' }, { icon: Heart, label: 'Apoio Mútuo' }, { icon: Sprout, label: 'Crescimento' }].map(item => (
              <div key={item.label} className="bg-white/5 border border-white/10 rounded-xl p-4 text-center">
                <item.icon className="w-6 h-6 text-brand-clay-light mx-auto mb-2" strokeWidth={1.75} />
                <div className="text-[11px] text-slate-400 font-semibold">{item.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right login panel */}
      <div className="flex-1 flex flex-col items-center justify-center p-8 lg:p-16">
        <div className="w-full max-w-md">
          <div className="flex lg:hidden items-center justify-center space-x-3 mb-8">
            <img src={logoEspalheMelodias} alt="Espalhe Melodias" className="w-12 h-12 rounded-xl object-cover shadow-lg" />
            <div>
              <div className="font-serif text-xl font-black text-brand-navy tracking-wide leading-none">Espalhe</div>
              <div className="font-script text-2xl text-brand-clay leading-none -mt-1">Melodias</div>
            </div>
          </div>

          <div className="mb-8">
            <h1 className="font-serif text-3xl font-bold text-brand-navy mb-2">Bem-vindo(a) de volta!</h1>
            <p className="text-slate-500 text-sm">Acesse sua área de membro para continuar conectado.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">E-mail</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="email" value={email} onChange={e => setEmail(e.target.value)}
                  placeholder="seu@email.com.br" required
                  className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-clay/40 focus:border-brand-clay transition placeholder:text-slate-300"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">Senha</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type={showPass ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••••" required
                  className="w-full pl-10 pr-12 py-3 bg-white border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-clay/40 focus:border-brand-clay transition placeholder:text-slate-300"
                />
                <button type="button" onClick={() => setShowPass(!showPass)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition">
                  {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 text-sm text-slate-600 cursor-pointer select-none">
                <input
                  type="checkbox" checked={rememberMe} onChange={e => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded accent-brand-clay"
                />
                Lembrar-me
              </label>
              <button type="button" onClick={() => setShowForgotModal(true)}
                className="text-sm font-semibold text-brand-clay hover:underline">
                Esqueci minha senha
              </button>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-xl flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            <button type="submit" disabled={loading}
              className="w-full py-3.5 bg-gradient-to-r from-brand-clay to-brand-clay-dark text-white font-bold text-sm rounded-xl hover:opacity-90 transition flex items-center justify-center space-x-2 shadow-lg shadow-brand-clay/25 disabled:opacity-60">
              {loading ? <span className="animate-spin text-xl">⟳</span> : (
                <><span>Entrar na Área de Membros</span><ArrowRight className="w-4 h-4" /></>
              )}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-slate-100 text-center">
            <button onClick={onGoToPublicSite}
              className="inline-flex items-center space-x-2 text-sm text-brand-moss font-semibold hover:text-brand-moss-dark transition group">
              <Globe className="w-4 h-4" />
              <span>Ver o site público do Espalhe Melodias</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
            </button>
          </div>
        </div>
      </div>

      {showForgotModal && <ForgotPasswordModal onClose={() => setShowForgotModal(false)} />}
    </div>
  );
}
