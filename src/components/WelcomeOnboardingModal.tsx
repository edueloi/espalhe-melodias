import React, { useState } from 'react';
import { Sparkles, ArrowRight, X, Loader2 } from 'lucide-react';
import { usersApi } from '../lib/api';
import logoFundoClaro from '../images/logo-para-fundo-claro.png';

interface Props {
  userName: string;
  onCompleteProfile: () => void;
  onSkipped: () => void;
}

export default function WelcomeOnboardingModal({ userName, onCompleteProfile, onSkipped }: Props) {
  const [skipping, setSkipping] = useState(false);
  const firstName = userName?.trim().split(' ')[0] || 'colega';

  const handleSkip = async () => {
    setSkipping(true);
    try {
      await usersApi.skipOnboarding();
    } catch {
      /* segue mesmo se falhar — não bloqueia o usuário */
    } finally {
      setSkipping(false);
      onSkipped();
    }
  };

  return (
    <div className="fixed inset-0 z-[100] bg-black/50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full overflow-hidden">
        <div className="bg-gradient-to-br from-brand-navy via-brand-navy to-brand-navy-dark px-8 pt-8 pb-10 text-center relative">
          <button
            onClick={handleSkip}
            disabled={skipping}
            className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-white transition"
            aria-label="Fechar"
          >
            <X className="w-4 h-4" />
          </button>
          <img src={logoFundoClaro} alt="Espalhe Melodias" className="h-14 w-auto object-contain mx-auto mb-5 bg-white/95 rounded-2xl px-4 py-2.5" />
          <div className="inline-flex items-center gap-1.5 bg-brand-clay/20 border border-brand-clay/30 text-brand-clay-light text-xs font-bold px-3 py-1.5 rounded-full mb-4">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Bem-vindo(a) à comunidade!</span>
          </div>
          <h1 className="font-serif text-2xl font-bold text-white leading-tight">
            Que alegria ter você aqui, {firstName}!
          </h1>
        </div>

        <div className="p-8">
          <p className="text-sm text-slate-600 leading-relaxed mb-6 text-center">
            Complete seu perfil profissional agora — especialidade, CRP e um pouco sobre você — para que outros colegas da comunidade possam te encontrar e se conectar.
          </p>

          <button
            onClick={onCompleteProfile}
            className="w-full py-3.5 bg-gradient-to-r from-brand-clay to-brand-clay-dark text-white font-bold text-sm rounded-xl hover:opacity-90 transition flex items-center justify-center gap-2 shadow-lg shadow-brand-clay/25 mb-3"
          >
            <span>Completar meu perfil agora</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <button
            onClick={handleSkip}
            disabled={skipping}
            className="w-full py-2.5 text-sm text-slate-400 hover:text-slate-600 font-semibold transition flex items-center justify-center gap-2"
          >
            {skipping ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
            Preencher depois
          </button>
        </div>
      </div>
    </div>
  );
}
