/**
 * Lista compartilhada de áreas profissionais, usada nos formulários de
 * cadastro/convite/admin (sem máscara de registro — isso fica só no
 * formulário de perfil profissional, ver PROF_TYPES em DirectoryView.tsx).
 */
export const PROFESSION_TYPES: Array<{ value: string; label: string }> = [
  { value: 'Psicólogo',              label: 'Psicólogo(a)' },
  { value: 'Médico',                 label: 'Médico(a)' },
  { value: 'Psiquiatra',             label: 'Psiquiatra' },
  { value: 'Fisioterapeuta',         label: 'Fisioterapeuta' },
  { value: 'Fonoaudiólogo',          label: 'Fonoaudiólogo(a)' },
  { value: 'Nutricionista',          label: 'Nutricionista' },
  { value: 'Terapeuta Ocupacional',  label: 'Terapeuta Ocupacional' },
  { value: 'Assistente Social',      label: 'Assistente Social' },
  { value: 'Educador Físico',        label: 'Educador(a) Físico(a)' },
  { value: 'Psicopedagogo',          label: 'Psicopedagogo(a)' },
  { value: 'Psicanalista',           label: 'Psicanalista' },
  { value: 'Pedagogo',               label: 'Pedagogo(a)' },
  { value: 'outro',                  label: 'Outro' },
];
