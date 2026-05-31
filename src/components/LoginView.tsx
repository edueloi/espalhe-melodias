import React, { useState } from 'react';
import { Eye, EyeOff, Lock, Mail, ArrowRight, Globe } from 'lucide-react';
import { ApiError } from '../lib/api';
import { useAuth } from '../lib/auth';

interface LoginViewProps {
  onLoginSuccess: () => void;
  onGoToPublicSite: () => void;
}

export default function LoginView({ onLoginSuccess, onGoToPublicSite }: LoginViewProps) {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const doLogin = async (e: string, p: string) => {
    setError('');
    setLoading(true);
    try {
      await login(e.trim(), p);
      onLoginSuccess();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Erro de conexão com o servidor.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (ev: React.FormEvent) => {
    ev.preventDefault();
    void doLogin(email, password);
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
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-brand-clay to-brand-moss flex items-center justify-center shadow-2xl">
              <span className="text-3xl text-white font-serif font-black italic">♩Ψ</span>
            </div>
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
            {[{ icon: '🤝', label: 'Conexões Reais' }, { icon: '💚', label: 'Apoio Mútuo' }, { icon: '🌱', label: 'Crescimento' }].map(item => (
              <div key={item.label} className="bg-white/5 border border-white/10 rounded-xl p-3 text-center">
                <div className="text-2xl mb-1">{item.icon}</div>
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
            <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-brand-clay to-brand-moss flex items-center justify-center shadow-lg">
              <span className="text-xl text-white font-serif font-black italic">♩Ψ</span>
            </div>
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

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-xl flex items-start space-x-2">
                <span>⚠️</span><span>{error}</span>
              </div>
            )}

            <button type="submit" disabled={loading}
              className="w-full py-3.5 bg-gradient-to-r from-brand-clay to-brand-clay-dark text-white font-bold text-sm rounded-xl hover:opacity-90 transition flex items-center justify-center space-x-2 shadow-lg shadow-brand-clay/25 disabled:opacity-60">
              {loading ? <span className="animate-spin text-xl">⟳</span> : (
                <><span>Entrar na Área de Membros</span><ArrowRight className="w-4 h-4" /></>
              )}
            </button>
          </form>

          {/* Demo quick access */}
          <div className="flex items-center my-6">
            <div className="flex-1 h-px bg-slate-200" />
            <span className="px-3 text-xs text-slate-400 font-semibold">ou acesso rápido de demonstração</span>
            <div className="flex-1 h-px bg-slate-200" />
          </div>

          <div className="grid grid-cols-1 gap-2">
            {[
              { e: 'dra.eliana@melodias.com.br', p: 'eliana2026',  label: 'Dra. Eliana Costa', role: 'Psicóloga', color: 'bg-cyan-50 text-cyan-800 border-cyan-200 hover:bg-cyan-100' },
              { e: 'gabriel.souza@gmail.com',    p: 'gabriel2026', label: 'Gabriel Souza',      role: 'Membro',   color: 'bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100' },
            ].map(item => (
              <button key={item.e} onClick={() => void doLogin(item.e, item.p)} disabled={loading}
                className={`w-full flex items-center justify-between px-4 py-2.5 rounded-xl border text-sm font-semibold transition disabled:opacity-50 ${item.color}`}>
                <span>{item.label}</span>
                <span className="text-xs font-normal opacity-70">{item.role}</span>
              </button>
            ))}
          </div>

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
    </div>
  );
}
