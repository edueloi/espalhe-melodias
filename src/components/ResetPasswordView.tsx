import React, { useState } from 'react';
import { Eye, EyeOff, Lock, ArrowRight, CheckCircle2, AlertCircle, LogIn } from 'lucide-react';
import { authApi, ApiError } from '../lib/api';
import logoEspalheMelodias from '../images/logo-espalhe-melodias.png';

interface Props {
  token: string;
  onGoToLogin: () => void;
}

export default function ResetPasswordView({ token, onGoToLogin }: Props) {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password.length < 6) {
      setError('A senha deve ter no mínimo 6 caracteres.');
      return;
    }
    if (password !== confirmPassword) {
      setError('As senhas não coincidem.');
      return;
    }

    setLoading(true);
    try {
      await authApi.resetPassword(token, password);
      setDone(true);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Erro de conexão. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-brand-cream flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        <div className="flex items-center justify-center space-x-3 mb-8">
          <img src={logoEspalheMelodias} alt="Espalhe Melodias" className="w-12 h-12 rounded-xl object-cover shadow-lg" />
          <div>
            <div className="font-serif text-xl font-black text-brand-navy tracking-wide leading-none">Espalhe</div>
            <div className="font-script text-2xl text-brand-clay leading-none -mt-1">Melodias</div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-lg border border-brand-sand p-8">
          {done ? (
            <div className="text-center py-4">
              <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto mb-4" />
              <h1 className="font-serif text-xl font-bold text-brand-navy mb-2">Senha redefinida!</h1>
              <p className="text-sm text-slate-500 leading-relaxed mb-6">
                Sua senha foi alterada com sucesso. Você já pode entrar com a nova senha.
              </p>
              <button onClick={onGoToLogin}
                className="w-full py-3 bg-brand-clay hover:bg-brand-clay-dark text-white font-bold text-sm rounded-xl transition flex items-center justify-center gap-2">
                <LogIn className="w-4 h-4" />Ir para o login
              </button>
            </div>
          ) : (
            <>
              <h1 className="font-serif text-xl font-bold text-brand-navy mb-2">Criar nova senha</h1>
              <p className="text-sm text-slate-500 mb-6">Escolha uma nova senha para acessar sua conta.</p>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">Nova senha</label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type={showPass ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)}
                      placeholder="••••••••••" required
                      className="w-full pl-10 pr-12 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-clay/40 focus:border-brand-clay transition"
                    />
                    <button type="button" onClick={() => setShowPass(!showPass)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition">
                      {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">Confirmar nova senha</label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type={showPass ? 'text' : 'password'} value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)}
                      placeholder="••••••••••" required
                      className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-clay/40 focus:border-brand-clay transition"
                    />
                  </div>
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
                    <><span>Redefinir senha</span><ArrowRight className="w-4 h-4" /></>
                  )}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
