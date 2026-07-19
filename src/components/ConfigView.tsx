import React, { useState } from 'react';
import {
  Settings, Database, ShieldCheck, Bell, Globe, Palette,
  RotateCcw, CheckCircle2, AlertTriangle, Lock, Cpu,
  Music2, Users, MessageSquare, BookOpen, Calendar,
  ChevronRight, Info, Wifi, HardDrive, RefreshCw, Crown, Zap, Star
} from 'lucide-react';
import { AppUser } from '../types';
import { PageWrapper, SectionTitle, ContentCard, Divider } from './ui/PageWrapper';

interface ConfigViewProps {
  currentUser: AppUser;
  onResetData: () => void;
  totalUsers: number;
  totalMaterials: number;
  totalTopics: number;
  totalEvents: number;
}

const SYSTEM_VERSION = '2.1.0';
const BUILD_DATE = 'Maio 2026';

export default function ConfigView({
  currentUser, onResetData, totalUsers, totalMaterials, totalTopics, totalEvents
}: ConfigViewProps) {
  const [notifications, setNotifications] = useState(true);
  const [publicProfile, setPublicProfile] = useState(true);
  const [confirmReset, setConfirmReset] = useState(false);

  const stats = [
    { icon: Users,       label: 'Usuários cadastrados', value: totalUsers },
    { icon: BookOpen,    label: 'Materiais na biblioteca', value: totalMaterials },
    { icon: MessageSquare, label: 'Tópicos no fórum',  value: totalTopics },
    { icon: Calendar,    label: 'Eventos registrados', value: totalEvents },
  ];

  return (
    <PageWrapper id="config-view" mobileBottomPad>
      <div className="space-y-6 sm:space-y-8 animate-fadeIn">

        {/* ── HEADER ── */}
        <ContentCard padding="md">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="p-2.5 bg-brand-clay/10 rounded-xl shrink-0">
                <Settings className="w-5 h-5 text-brand-clay" />
              </div>
              <div>
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="text-[10px] font-bold text-brand-clay uppercase tracking-widest flex items-center gap-1">
                    <Crown className="w-3 h-3" />
                    Premium Ativo
                  </span>
                </div>
                <h2 className="text-lg sm:text-xl font-serif font-bold text-brand-navy">
                  Configurações & Controle
                </h2>
                <p className="text-xs text-slate-400 mt-0.5 max-w-lg">
                  Gerencie sua plataforma, preferências e dados do ecossistema Espalhe Melodias.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 px-4 py-2 bg-brand-clay/5 border border-brand-clay/20 rounded-xl shrink-0">
              <Star className="w-4 h-4 text-brand-clay" />
              <div className="text-right">
                <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">Seu Acesso</p>
                <p className="text-sm font-black text-brand-navy">100%</p>
              </div>
            </div>
          </div>

          {/* System Stats Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-5 pt-5 border-t border-brand-sand/60">
            {[
              { label: 'Versão', value: SYSTEM_VERSION, icon: Cpu },
              { label: 'Build', value: BUILD_DATE, icon: Calendar },
              { label: 'Armazenamento', value: 'API + MySQL', icon: HardDrive },
              { label: 'Status', value: 'Online', icon: Wifi, green: true },
            ].map(item => (
              <div key={item.label} className="text-center">
                <p className={`text-sm font-black flex items-center justify-center gap-1 ${item.green ? 'text-emerald-600' : 'text-brand-navy'}`}>
                  <item.icon className="w-3.5 h-3.5" />
                  {item.value}
                </p>
                <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mt-0.5">{item.label}</p>
              </div>
            ))}
          </div>
        </ContentCard>

        {/* ── DADOS DO SISTEMA ── */}
        <ContentCard padding="lg" id="config-system-data" className="border border-brand-sand/60">
          <SectionTitle
            title="Panorama dos Dados"
            description="Totals armazenados no sistema"
            icon={Database}
            divider
          />
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-5 mt-6">
            {stats.map(s => (
              <div key={s.label}
                className="bg-gradient-to-br from-white to-slate-50 border border-brand-sand/60 rounded-lg p-4 sm:p-5 text-center hover:shadow-md hover:border-brand-clay/40 transition">
                <div className="w-10 h-10 rounded-lg bg-brand-clay/10 border border-brand-clay/20 flex items-center justify-center mx-auto mb-3">
                  <s.icon className="w-5 h-5 text-brand-clay" />
                </div>
                <p className="text-3xl sm:text-4xl font-black text-brand-navy">{s.value}</p>
                <p className="text-xs sm:text-sm text-slate-600 font-semibold mt-2 leading-tight">{s.label}</p>
              </div>
            ))}
          </div>

          <div className="mt-6 p-4 sm:p-5 bg-brand-moss/5 border border-brand-moss/20 rounded-lg flex items-start gap-3">
            <Info className="w-5 h-5 text-brand-moss shrink-0 mt-0.5" />
            <p className="text-sm text-brand-moss-dark leading-relaxed">
              Os dados principais da plataforma são persistidos pela API e pelo banco MySQL.
              Todos os registros estão sincronizados em tempo real.
            </p>
          </div>
        </ContentCard>

        {/* ── PREFERÊNCIAS ── */}
        <ContentCard padding="lg" id="config-preferences" className="border border-brand-sand/60">
          <SectionTitle title="Preferências" icon={Palette} divider />
          <div className="space-y-3 mt-6">
            {[
              {
                id: 'pref-notifications',
                icon: Bell,
                title: 'Notificações do Sistema',
                desc: 'Receber alertas de novas solicitações, respostas no fórum e eventos próximos.',
                checked: notifications,
                onChange: setNotifications,
              },
              {
                id: 'pref-public-profile',
                icon: Globe,
                title: 'Perfil Público Visível',
                desc: 'Permitir que seu perfil profissional apareça no diretório público do site Melodias.',
                checked: publicProfile,
                onChange: setPublicProfile,
              },
            ].map(pref => (
              <div key={pref.id} id={pref.id}
                className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-5 bg-gradient-to-br from-white to-slate-50/50 border border-brand-sand/60 rounded-lg hover:border-brand-clay/40 hover:shadow-md transition">
                <div className="flex items-start gap-4 flex-1">
                  <div className="p-2.5 bg-brand-clay/10 border border-brand-clay/20 rounded-lg shrink-0">
                    <pref.icon className="w-5 h-5 text-brand-clay" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-brand-navy">{pref.title}</p>
                    <p className="text-sm text-slate-600 mt-1 leading-relaxed">{pref.desc}</p>
                  </div>
                </div>
                <button
                  onClick={() => pref.onChange(!pref.checked)}
                  className={`relative w-12 h-6 rounded-full border-2 transition-all shrink-0 ${
                    pref.checked
                      ? 'bg-brand-moss border-brand-moss'
                      : 'bg-slate-200 border-slate-200'
                  }`}
                >
                  <span className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow-sm transition-all ${
                    pref.checked ? 'translate-x-6' : 'translate-x-0'
                  }`} />
                </button>
              </div>
            ))}
          </div>
        </ContentCard>

        {/* ── INTEGRIDADE CRP ── */}
        <ContentCard padding="lg" id="config-crp" className="border border-brand-moss/30 bg-gradient-to-br from-white to-brand-moss/5">
          <SectionTitle title="Integridade Profissional" icon={ShieldCheck} divider />
          <div className="space-y-3 mt-6">
            {[
              {
                icon: Lock,
                title: 'Registro CRP Obrigatório',
                desc: 'Cada psicólogo verificado tem responsabilidade técnica sobre suas respostas no fórum, necessitando o registro CRP ativo no conselho regional correspondente.',
              },
              {
                icon: ShieldCheck,
                title: 'Sigilo Garantido',
                desc: 'Relatos de membros no canal "Preciso de Ajuda" são protegidos por sigilo profissional e encaminhados apenas a psicólogos aprovados pela equipe Melodias.',
              },
              {
                icon: Music2,
                title: 'Ética e Pertencimento',
                desc: 'O Espalhe Melodias segue as diretrizes éticas do CFP/CRP. Toda conduta dos profissionais deve respeitar o Código de Ética dos Psicólogos.',
              },
            ].map((item, i) => (
              <div key={i} className="flex items-start gap-4 p-4 sm:p-5 bg-white border border-brand-moss/15 rounded-lg hover:shadow-md transition">
                <div className="p-2.5 bg-brand-moss/15 rounded-lg shrink-0 mt-0.5">
                  <item.icon className="w-5 h-5 text-brand-moss" />
                </div>
                <div>
                  <p className="text-sm font-bold text-brand-navy">{item.title}</p>
                  <p className="text-sm text-slate-600 mt-1 leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </ContentCard>

        {/* ── AÇÕES DO SISTEMA ── */}
        <ContentCard padding="lg" id="config-actions" className="border border-brand-sand/60">
          <SectionTitle title="Ações do Sistema" icon={Cpu} divider />

          <div className="space-y-4 mt-6">
            {/* Info sobre backup */}
            <div className="p-5 sm:p-6 bg-blue-50 border border-blue-200/60 rounded-lg flex items-start gap-4">
              <div className="p-2.5 bg-blue-100 rounded-lg shrink-0 mt-0.5">
                <HardDrive className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-bold text-blue-900">Backup em Tempo Real</p>
                <p className="text-sm text-blue-700 mt-2 leading-relaxed">
                  Todas as interações — triagens, comentários do fórum, inscrições em eventos — estão
                  consolidadas localmente e sincronizadas automaticamente a cada mudança.
                </p>
              </div>
            </div>

            {/* Reset */}
            <div className="p-5 sm:p-6 bg-red-50 border border-red-200/60 rounded-lg">
              <div className="flex items-start gap-4 mb-4">
                <div className="p-2.5 bg-red-100 rounded-lg shrink-0 mt-0.5">
                  <AlertTriangle className="w-5 h-5 text-red-600" />
                </div>
                <div>
                  <p className="text-sm font-bold text-red-900">Redefinir Todos os Dados</p>
                  <p className="text-sm text-red-700 mt-2 leading-relaxed">
                    Esta ação irá apagar todas as interações, mensagens, inscrições e configurações
                    personalizadas, retornando ao estado inicial de demonstração. <strong>Irreversível.</strong>
                  </p>
                </div>
              </div>

              {!confirmReset ? (
                <button
                  id="btn-show-reset-confirm"
                  onClick={() => setConfirmReset(true)}
                  className="flex items-center gap-2 px-4 py-2.5 bg-white border border-red-300 text-red-600 text-sm font-bold rounded-lg hover:bg-red-50 transition"
                >
                  <RotateCcw className="w-4 h-4" />
                  Redefinir dados do sistema
                </button>
              ) : (
                <div className="flex flex-col sm:flex-row sm:items-center gap-3 bg-red-100 border border-red-300 rounded-lg p-4">
                  <p className="text-sm font-bold text-red-900 flex-1">Confirma a redefinição completa?</p>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setConfirmReset(false)}
                      className="px-4 py-2 text-sm font-bold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition">
                      Cancelar
                    </button>
                    <button
                      id="btn-confirm-reset"
                      onClick={() => { setConfirmReset(false); onResetData(); }}
                      className="flex items-center gap-2 px-4 py-2 text-sm font-bold text-white bg-red-600 rounded-lg hover:bg-red-700 transition">
                      <RefreshCw className="w-4 h-4" />
                      Confirmar Reset
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </ContentCard>

        {/* ── SOBRE O SISTEMA ── */}
        <ContentCard padding="lg" id="config-about" className="bg-gradient-to-br from-white to-slate-50/50 border border-brand-sand/60">
          <div className="flex items-center gap-4 mb-5">
            <div className="w-12 h-12 rounded-lg bg-gradient-to-tr from-brand-clay to-brand-moss flex items-center justify-center shadow-md shrink-0">
              <span className="text-xl text-white font-serif font-black italic">♩Ψ</span>
            </div>
            <div>
              <p className="text-lg font-serif font-bold text-brand-navy">Espalhe Melodias</p>
              <p className="text-sm text-slate-600">Conexões em Saúde Mental · v{SYSTEM_VERSION}</p>
            </div>
          </div>
          <Divider className="mb-5" />
          <p className="text-sm text-slate-700 leading-relaxed">
            Plataforma desenvolvida para conectar profissionais da saúde mental de Tatuí e região,
            promovendo troca de experiências, apoio mútuo e crescimento coletivo.
            Idealizado por <strong className="text-brand-clay">Jéssica Muhamed</strong> e{' '}
            <strong className="text-brand-moss">Karen Gomes</strong>.
          </p>
          <p className="text-base text-slate-600 mt-4 font-script italic">
            "Cada conexão é uma nota que, junta com outras, cria uma linda melodia." ♡
          </p>
        </ContentCard>

      </div>
    </PageWrapper>
  );
}
