import React, { useState } from 'react';
import {
  Settings, Database, ShieldCheck, Bell, Globe, Palette,
  RotateCcw, CheckCircle2, AlertTriangle, Lock, Cpu,
  Music2, Users, MessageSquare, BookOpen, Calendar,
  ChevronRight, Info, Wifi, HardDrive, RefreshCw
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
    <PageWrapper id="config-view">
      <div className="max-w-3xl mx-auto space-y-5 sm:space-y-6 animate-fadeIn">

        {/* ── PAGE HEADER ── */}
        <ContentCard padding="md" id="config-header">
          <div className="flex items-start gap-3">
            <div className="p-2.5 bg-brand-navy/5 rounded-xl shrink-0">
              <Settings className="w-5 h-5 text-brand-navy" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-serif font-bold text-brand-navy">
                Configurações do Sistema
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Gerencie preferências, dados e parâmetros do ecossistema Espalhe Melodias.
              </p>
            </div>
          </div>

          {/* System info strip */}
          <div className="flex flex-wrap items-center gap-3 mt-5 pt-5 border-t border-brand-sand/60">
            {[
              { label: 'Versão', value: SYSTEM_VERSION, icon: Cpu },
              { label: 'Build', value: BUILD_DATE, icon: Calendar },
              { label: 'Armazenamento', value: 'API + MySQL', icon: HardDrive },
              { label: 'Status', value: 'Online', icon: Wifi, green: true },
            ].map(item => (
              <div key={item.label} className="flex items-center gap-1.5 bg-slate-50 border border-slate-100 rounded-lg px-3 py-1.5">
                <item.icon className={`w-3 h-3 ${item.green ? 'text-emerald-500' : 'text-slate-400'}`} />
                <span className="text-[10px] font-semibold text-slate-500">{item.label}:</span>
                <span className={`text-[10px] font-bold ${item.green ? 'text-emerald-600' : 'text-brand-navy'}`}>{item.value}</span>
              </div>
            ))}
          </div>
        </ContentCard>

        {/* ── DADOS DO SISTEMA ── */}
        <ContentCard padding="md" id="config-system-data">
          <SectionTitle
            title="Panorama dos Dados"
            description="Totais armazenados no sistema"
            icon={Database}
            divider
          />
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4">
            {stats.map(s => (
              <div key={s.label}
                className="bg-brand-cream border border-brand-sand rounded-xl p-3 text-center hover:shadow-sm transition">
                <div className="w-8 h-8 rounded-lg bg-white border border-brand-sand flex items-center justify-center mx-auto mb-2">
                  <s.icon className="w-4 h-4 text-brand-clay" />
                </div>
                <p className="text-xl font-black text-brand-navy">{s.value}</p>
                <p className="text-[10px] text-slate-400 font-semibold mt-0.5 leading-tight">{s.label}</p>
              </div>
            ))}
          </div>

          <div className="mt-4 p-3 bg-brand-moss/5 border border-brand-moss/20 rounded-xl flex items-start gap-2.5">
            <Info className="w-4 h-4 text-brand-moss shrink-0 mt-0.5" />
            <p className="text-xs text-brand-moss-dark leading-relaxed">
              Os dados principais da plataforma são persistidos pela API e pelo banco MySQL.
              Alguns controles visuais desta tela ainda estão em fase final de integração.
            </p>
          </div>
        </ContentCard>

        {/* ── PREFERÊNCIAS ── */}
        <ContentCard padding="md" id="config-preferences">
          <SectionTitle title="Preferências" icon={Palette} divider />
          <div className="space-y-3 mt-4">
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
                className="flex items-center justify-between gap-4 p-4 bg-slate-50/60 border border-brand-sand/60 rounded-xl hover:bg-brand-sand/20 transition">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-white border border-brand-sand rounded-lg shrink-0">
                    <pref.icon className="w-4 h-4 text-brand-clay" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-brand-navy">{pref.title}</p>
                    <p className="text-[11px] text-slate-400 mt-0.5 leading-relaxed max-w-sm">{pref.desc}</p>
                  </div>
                </div>
                <button
                  onClick={() => pref.onChange(!pref.checked)}
                  className={`relative w-10 h-5.5 rounded-full border-2 transition-all shrink-0 ${
                    pref.checked
                      ? 'bg-brand-moss border-brand-moss'
                      : 'bg-slate-200 border-slate-200'
                  }`}
                >
                  <span className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow-sm transition-all ${
                    pref.checked ? 'translate-x-[18px]' : 'translate-x-0'
                  }`} />
                </button>
              </div>
            ))}
          </div>
        </ContentCard>

        {/* ── INTEGRIDADE CRP ── */}
        <ContentCard padding="md" id="config-crp">
          <SectionTitle title="Integridade Profissional" icon={ShieldCheck} divider />
          <div className="space-y-3 mt-4">
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
              <div key={i} className="flex items-start gap-3 p-3.5 bg-brand-moss/5 border border-brand-moss/15 rounded-xl">
                <div className="p-1.5 bg-brand-moss/10 rounded-lg shrink-0 mt-0.5">
                  <item.icon className="w-3.5 h-3.5 text-brand-moss" />
                </div>
                <div>
                  <p className="text-xs font-bold text-brand-navy">{item.title}</p>
                  <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </ContentCard>

        {/* ── AÇÕES DO SISTEMA ── */}
        <ContentCard padding="md" id="config-actions">
          <SectionTitle title="Ações do Sistema" icon={Cpu} divider />

          <div className="space-y-3 mt-4">
            {/* Info sobre backup */}
            <div className="p-4 bg-blue-50/60 border border-blue-100 rounded-xl flex items-start gap-3">
              <HardDrive className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-bold text-blue-800">Backup em Tempo Real</p>
                <p className="text-[11px] text-blue-600 mt-0.5 leading-relaxed">
                  Todas as interações — triagens, comentários do fórum, inscrições em eventos — estão
                  consolidadas localmente e sincronizadas automaticamente a cada mudança.
                </p>
              </div>
            </div>

            {/* Reset */}
            <div className="p-4 bg-red-50/60 border border-red-100 rounded-xl">
              <div className="flex items-start gap-3 mb-3">
                <AlertTriangle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-bold text-red-800">Redefinir Todos os Dados</p>
                  <p className="text-[11px] text-red-500 mt-0.5 leading-relaxed">
                    Esta ação irá apagar todas as interações, mensagens, inscrições e configurações
                    personalizadas, retornando ao estado inicial de demonstração. <strong>Irreversível.</strong>
                  </p>
                </div>
              </div>

              {!confirmReset ? (
                <button
                  id="btn-show-reset-confirm"
                  onClick={() => setConfirmReset(true)}
                  className="flex items-center gap-1.5 px-4 py-2 bg-white border border-red-200 text-red-600 text-xs font-bold rounded-xl hover:bg-red-50 transition"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  Redefinir dados do sistema
                </button>
              ) : (
                <div className="flex items-center gap-3 bg-red-100 border border-red-200 rounded-xl p-3">
                  <p className="text-xs font-bold text-red-800 flex-1">Confirma a redefinição completa?</p>
                  <button
                    onClick={() => setConfirmReset(false)}
                    className="px-3 py-1.5 text-xs font-bold text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition">
                    Cancelar
                  </button>
                  <button
                    id="btn-confirm-reset"
                    onClick={() => { setConfirmReset(false); onResetData(); }}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-white bg-red-600 rounded-lg hover:bg-red-700 transition">
                    <RefreshCw className="w-3 h-3" />
                    Confirmar Reset
                  </button>
                </div>
              )}
            </div>
          </div>
        </ContentCard>

        {/* ── SOBRE O SISTEMA ── */}
        <ContentCard padding="md" id="config-about">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-clay to-brand-moss flex items-center justify-center shadow-md shrink-0">
              <span className="text-lg text-white font-serif font-black italic">♩Ψ</span>
            </div>
            <div>
              <p className="text-sm font-serif font-bold text-brand-navy">Espalhe Melodias</p>
              <p className="text-[11px] text-slate-400">Conexões em Saúde Mental · v{SYSTEM_VERSION}</p>
            </div>
          </div>
          <Divider className="mb-4" />
          <p className="text-xs text-slate-500 leading-relaxed">
            Plataforma desenvolvida para conectar profissionais da saúde mental de Tatuí e região,
            promovendo troca de experiências, apoio mútuo e crescimento coletivo.
            Idealizado por <strong className="text-brand-clay">Jéssica Muhamed</strong> e{' '}
            <strong className="text-brand-moss">Karen Gomes</strong>.
          </p>
          <p className="text-[11px] text-slate-400 mt-3 font-script text-base">
            "Cada conexão é uma nota que, junta com outras, cria uma linda melodia." ♡
          </p>
        </ContentCard>

      </div>
    </PageWrapper>
  );
}
