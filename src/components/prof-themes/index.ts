// Registro central de modelos de site público do profissional
// Cada modelo tem um id, nome, descrição e preview para o seletor

export type TemplateId = 'melodias' | 'minimal' | 'card' | 'dark';

export interface TemplateInfo {
  id: TemplateId;
  name: string;
  description: string;
  // Miniaturas de preview (cores representativas)
  previewBg: string;
  previewAccent: string;
  previewStyle: 'light-hero' | 'light-clean' | 'light-card' | 'dark';
}

export const TEMPLATES: TemplateInfo[] = [
  {
    id: 'melodias',
    name: 'Melodias',
    description: 'Modelo padrão da rede. Hero imersivo com gradiente, navbar transparente e seções bem estruturadas.',
    previewBg: '#f7fbf2',
    previewAccent: '#567736',
    previewStyle: 'light-hero',
  },
  {
    id: 'minimal',
    name: 'Minimal',
    description: 'Design clean e tipográfico. Nome em destaque, avatar grande, sem distrações.',
    previewBg: '#ffffff',
    previewAccent: '#a75a35',
    previewStyle: 'light-clean',
  },
  {
    id: 'card',
    name: 'Card',
    description: 'Sidebar com seu card profissional fixo à esquerda e conteúdo detalhado à direita.',
    previewBg: '#f4f4f0',
    previewAccent: '#0477a6',
    previewStyle: 'light-card',
  },
  {
    id: 'dark',
    name: 'Dark',
    description: 'Visual escuro premium com efeito glow. Ideal para uma presença marcante e moderna.',
    previewBg: '#0a0a0f',
    previewAccent: '#a75a35',
    previewStyle: 'dark',
  },
];

// Campo que salva o modelo escolhido — mapeado sobre o campo `theme` da API
// (forest = melodias, ocean = card, rose = minimal, gold = dark)
export const THEME_TO_TEMPLATE: Record<string, TemplateId> = {
  forest:   'melodias',
  minimal:  'minimal',
  card:     'card',
  dark:     'dark',
  // fallbacks de nomes antigos
  ocean:    'card',
  rose:     'minimal',
  gold:     'dark',
};

export const TEMPLATE_TO_THEME: Record<TemplateId, string> = {
  melodias: 'forest',
  minimal:  'minimal',
  card:     'card',
  dark:     'dark',
};
