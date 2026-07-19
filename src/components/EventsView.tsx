import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Calendar, Users, Plus, Check,
  Clock, User, RefreshCw, Music2, ChevronRight,
  Upload, Trash2, Link2, Share2, Copy, Package,
  MapPin, Pencil, X, BarChart2, MessageCircle,
  UserX, TrendingUp, Search,
} from 'lucide-react';
import { eventsApi, type HealthEvent, type EventItemList, tokenStore } from '../lib/api';
import { useAuth } from '../lib/auth';
import {
  Button, IconButton,
  Modal, ModalFooter, ConfirmModal,
  Input, Textarea, Select, DatePicker,
  Switch,
  FormRow, Divider,
  Badge, EmptyState,
  PageWrapper, ContentCard, StatGrid,
  useToast,
} from './ui';
import { StatCard } from './ui';

// ─── Alias local para o tipo vindo do api.ts ─────────────────────────────────
type ItemList = EventItemList;

// ─── Tipos locais para RSVP ───────────────────────────────────────────────────

interface RsvpRow {
  id: string;
  user_id: string | null;
  name: string;          // coluna real no banco
  phone?: string;        // coluna real no banco
  attendance: 'confirmed' | 'present' | 'absent';
  guests: number;
  item_id?: string;
  item_name?: string;    // vem do JOIN com event_items
  observation?: string;
}

// ─── Constantes ───────────────────────────────────────────────────────────────

const CATEGORIES = [
  'Grupo de Apoio',
  'Palestra Vivencial',
  'Workshop',
  'Meditação Coletiva',
] as const;

const CAT_META: Record<string, { color: 'success' | 'info' | 'warning' | 'purple'; icon: string }> = {
  'Grupo de Apoio':     { color: 'success', icon: '🫂' },
  'Palestra Vivencial': { color: 'info',    icon: '🎙️' },
  'Workshop':           { color: 'warning', icon: '🛠️' },
  'Meditação Coletiva': { color: 'purple',  icon: '🧘' },
};

function uid() {
  return Math.random().toString(36).slice(2, 10);
}

// ─── Estado inicial do formulário de evento ───────────────────────────────────

const EMPTY_FORM = {
  coverUrl: '',
  title: '',
  date: '',
  time: '',
  category: 'Grupo de Apoio' as typeof CATEGORIES[number],
  location: '',
  mapLink: '',
  description: '',
  rsvp: true,
  allowGuests: false,
  itemDivision: false,
  selectedListId: '',
  divisionItems: [] as string[],
};

// ─── Modal de gerenciar listas ────────────────────────────────────────────────

interface ManageListsModalProps {
  isOpen: boolean;
  onClose: () => void;
  lists: ItemList[];
  onRefresh: () => void;
}

function ManageListsModal({ isOpen, onClose, lists, onRefresh }: ManageListsModalProps) {
  const toast = useToast();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editItems, setEditItems] = useState<string[]>([]);
  const [newListName, setNewListName] = useState('');
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  function startEdit(list: ItemList) {
    setEditingId(list.id);
    setEditName(list.name);
    setEditItems([...list.items]);
  }

  function cancelEdit() {
    setEditingId(null);
    setEditName('');
    setEditItems([]);
  }

  async function saveEdit() {
    if (!editName.trim()) { toast.error('Informe um nome para a lista.'); return; }
    setSaving(true);
    try {
      await eventsApi.updateItemList(editingId!, {
        name: editName.trim(),
        items: editItems.filter(i => i.trim()),
      });
      toast.success('Lista atualizada.');
      onRefresh();
      cancelEdit();
    } catch { toast.error('Erro ao salvar.'); }
    finally { setSaving(false); }
  }

  async function createList() {
    if (!newListName.trim()) { toast.error('Informe um nome.'); return; }
    setSaving(true);
    try {
      const created = await eventsApi.createItemList({ name: newListName.trim(), items: [''] });
      toast.success('Lista criada. Adicione os itens.');
      setNewListName('');
      onRefresh();
      startEdit(created);
    } catch { toast.error('Erro ao criar lista.'); }
    finally { setSaving(false); }
  }

  async function deleteList(id: string) {
    try {
      await eventsApi.deleteItemList(id);
      toast.success('Lista excluída.');
      onRefresh();
    } catch { toast.error('Erro ao excluir.'); }
    setConfirmDeleteId(null);
  }

  function addEditItem() {
    setEditItems(prev => [...prev, '']);
  }

  function updateEditItem(idx: number, val: string) {
    setEditItems(prev => prev.map((it, i) => (i === idx ? val : it)));
  }

  function removeEditItem(idx: number) {
    setEditItems(prev => prev.filter((_, i) => i !== idx));
  }

  return (
    <>
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        title="Gerenciar Listas Pré-definidas"
        size="lg"
        mobileStyle="bottom-sheet"
        closeOnBackdrop={false}
        footer={
          <ModalFooter>
            <Button variant="outline" onClick={onClose}>Fechar</Button>
          </ModalFooter>
        }
      >
        <div className="space-y-5">
          {/* Nova lista */}
          <div className="flex gap-2">
            <Input
              placeholder="Nome da nova lista..."
              value={newListName}
              onChange={e => setNewListName(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && createList()}
              wrapperClassName="flex-1"
            />
            <Button variant="success" iconLeft={<Plus size={14} />} onClick={createList}>
              Criar
            </Button>
          </div>

          <Divider />

          {lists.length === 0 && (
            <EmptyState
              icon={Package}
              title="Nenhuma lista criada"
              description="Crie uma lista pré-definida para reutilizar itens em eventos."
            />
          )}

          <div className="space-y-3">
            {lists.map(list => (
              <div key={list.id} className="rounded-2xl border border-zinc-200 bg-zinc-50 overflow-hidden">
                {editingId === list.id ? (
                  /* Modo edição */
                  <div className="p-4 space-y-3">
                    <Input
                      label="Nome da lista"
                      value={editName}
                      onChange={e => setEditName(e.target.value)}
                    />
                    <div className="space-y-2">
                      <p className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider">Itens</p>
                      {editItems.map((item, idx) => (
                        <div key={idx} className="flex gap-2 items-center">
                          <Input
                            placeholder={`Item ${idx + 1}`}
                            value={item}
                            onChange={e => updateEditItem(idx, e.target.value)}
                            wrapperClassName="flex-1"
                          />
                          <IconButton
                            variant="danger"
                            size="sm"
                            onClick={() => removeEditItem(idx)}
                            title="Remover item"
                          >
                            <Trash2 size={13} />
                          </IconButton>
                        </div>
                      ))}
                      <Button
                        variant="ghost"
                        size="sm"
                        iconLeft={<Plus size={13} />}
                        onClick={addEditItem}
                      >
                        Adicionar item
                      </Button>
                    </div>
                    <div className="flex gap-2 justify-end pt-2">
                      <Button variant="outline" size="sm" onClick={cancelEdit}>Cancelar</Button>
                      <Button variant="success" size="sm" onClick={saveEdit}>Salvar</Button>
                    </div>
                  </div>
                ) : (
                  /* Modo visualização */
                  <div className="flex items-center justify-between p-3.5 gap-3">
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-zinc-800 truncate">{list.name}</p>
                      <p className="text-[11px] text-zinc-400 mt-0.5">
                        {list.items.filter(i => i.trim()).length} {list.items.filter(i => i.trim()).length === 1 ? 'item' : 'itens'}
                      </p>
                    </div>
                    <div className="flex gap-1.5 shrink-0">
                      <IconButton size="sm" variant="ghost" onClick={() => startEdit(list)} title="Editar">
                        <Pencil size={13} />
                      </IconButton>
                      <IconButton size="sm" variant="danger" onClick={() => setConfirmDeleteId(list.id)} title="Excluir">
                        <Trash2 size={13} />
                      </IconButton>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </Modal>

      <ConfirmModal
        isOpen={!!confirmDeleteId}
        onClose={() => setConfirmDeleteId(null)}
        onConfirm={() => confirmDeleteId && deleteList(confirmDeleteId)}
        title="Excluir lista"
        message="Esta lista será removida permanentemente. Deseja continuar?"
        confirmLabel="Excluir"
        variant="danger"
      />
    </>
  );
}

// ─── Modal de link do evento ──────────────────────────────────────────────────

interface EventLinkModalProps {
  isOpen: boolean;
  onClose: () => void;
  eventId: string;
  eventTitle: string;
}

function EventLinkModal({ isOpen, onClose, eventId, eventTitle }: EventLinkModalProps) {
  const toast = useToast();
  const publicUrl = `${window.location.origin}/evento/${eventId}`;

  function copyLink() {
    navigator.clipboard.writeText(publicUrl)
      .then(() => toast.success('Link copiado!'))
      .catch(() => toast.error('Não foi possível copiar o link.'));
  }

  async function shareLink() {
    if (navigator.share) {
      try {
        await navigator.share({ title: eventTitle, url: publicUrl });
      } catch {
        // usuário cancelou ou erro — ignora
      }
    } else {
      copyLink();
    }
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Evento publicado!"
      size="sm"
      mobileStyle="center"
      footer={
        <ModalFooter>
          <Button variant="outline" onClick={onClose}>Fechar</Button>
          {typeof navigator !== 'undefined' && 'share' in navigator && (
            <Button variant="primary" iconLeft={<Share2 size={14} />} onClick={shareLink}>
              Compartilhar
            </Button>
          )}
        </ModalFooter>
      }
    >
      <div className="space-y-4">
        <div className="flex items-center gap-2 p-3 bg-emerald-50 border border-emerald-200 rounded-xl">
          <Check size={16} className="text-emerald-600 shrink-0" />
          <p className="text-sm font-semibold text-emerald-800">
            O evento <strong>"{eventTitle}"</strong> foi publicado com sucesso.
          </p>
        </div>

        <div>
          <p className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider mb-2">Link público do evento</p>
          <div className="flex gap-2 items-center">
            <div className="flex-1 rounded-[10px] border border-zinc-200 bg-zinc-50 px-3 py-2.5 text-xs text-zinc-600 font-mono truncate">
              {publicUrl}
            </div>
            <IconButton variant="outline" size="md" onClick={copyLink} title="Copiar link">
              <Copy size={15} />
            </IconButton>
          </div>
          <p className="text-[11px] text-zinc-400 mt-1.5">
            A página pública ainda não existe — o link pode ser compartilhado para uso futuro.
          </p>
        </div>
      </div>
    </Modal>
  );
}

// ─── Modal principal de criar evento ─────────────────────────────────────────

interface CreateEventModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (eventId: string, eventTitle: string) => void;
  lists: ItemList[];
  onOpenManageLists: () => void;
}

function CreateEventModal({ isOpen, onClose, onSuccess, lists, onOpenManageLists }: CreateEventModalProps) {
  const toast = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState({ ...EMPTY_FORM });
  const [submitting, setSubmitting] = useState(false);

  // Reset ao fechar/abrir
  useEffect(() => {
    if (isOpen) setForm({ ...EMPTY_FORM });
  }, [isOpen]);

  function set<K extends keyof typeof EMPTY_FORM>(key: K, value: typeof EMPTY_FORM[K]) {
    setForm(prev => ({ ...prev, [key]: value }));
  }

  // Imagem de capa
  function handleCoverClick() {
    fileInputRef.current?.click();
  }

  function handleCoverChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      toast.error('Selecione um arquivo de imagem.');
      return;
    }
    // Converte para base64 para persistir no banco (blob URLs não sobrevivem entre abas)
    const reader = new FileReader();
    reader.onload = (ev) => {
      set('coverUrl', ev.target?.result as string ?? '');
    };
    reader.readAsDataURL(file);
  }

  // Divisão de itens — selecionar lista pré-definida
  function handleSelectList(listId: string) {
    set('selectedListId', listId);
    if (listId && listId !== '__none__') {
      const found = lists.find(l => l.id === listId);
      if (found) {
        set('divisionItems', [...found.items.filter(i => i.trim())]);
      }
    } else {
      set('divisionItems', []);
    }
  }

  function addDivisionItem() {
    setForm(prev => ({ ...prev, divisionItems: [...prev.divisionItems, ''] }));
  }

  function updateDivisionItem(idx: number, val: string) {
    setForm(prev => ({
      ...prev,
      divisionItems: prev.divisionItems.map((it, i) => (i === idx ? val : it)),
    }));
  }

  function removeDivisionItem(idx: number) {
    setForm(prev => ({
      ...prev,
      divisionItems: prev.divisionItems.filter((_, i) => i !== idx),
    }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!form.title.trim()) { toast.error('Informe o título do evento.'); return; }
    if (!form.date) { toast.error('Informe a data do evento.'); return; }
    if (!form.time) { toast.error('Informe o horário do evento.'); return; }
    if (!form.location.trim()) { toast.error('Informe a localização/formato do evento.'); return; }

    setSubmitting(true);
    try {
      const result = await eventsApi.create({
        title: form.title.trim(),
        date: form.date,
        time: form.time,
        description: form.description.trim(),
        category: form.category,
        location: form.location.trim() || undefined,
        mapLink: form.mapLink.trim() || undefined,
        coverUrl: form.coverUrl || undefined,
        rsvpEnabled: form.rsvp,
        allowGuests: form.allowGuests,
        itemDivision: form.itemDivision,
        divisionItems: form.itemDivision
          ? form.divisionItems.filter(i => i.trim())
          : [],
      });
      const newId = result.id ?? (result as unknown as { data?: { id: string } }).data?.id ?? 'novo';
      onSuccess(newId, form.title.trim());
      onClose();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Erro ao publicar evento.';
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Criar Novo Encontro"
      size="xl"
      mobileStyle="bottom-sheet"
      footer={
        <ModalFooter>
          <Button variant="outline" onClick={onClose} disabled={submitting}>Cancelar</Button>
          <Button
            variant="success"
            loading={submitting}
            iconLeft={<Plus size={14} />}
            onClick={(e) => handleSubmit(e as unknown as React.FormEvent)}
          >
            Publicar Evento
          </Button>
        </ModalFooter>
      }
    >
      <form id="modal-event-create-form" onSubmit={handleSubmit} className="space-y-5">

        {/* Imagem de capa */}
        <div>
          <p className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider mb-2">Imagem de Capa (opcional)</p>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleCoverChange}
          />
          {form.coverUrl ? (
            <div className="relative rounded-2xl overflow-hidden border border-zinc-200 group">
              <img src={form.coverUrl} alt="Capa do evento" className="w-full h-40 object-cover" />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center gap-3">
                <Button
                  variant="outline"
                  size="sm"
                  iconLeft={<Upload size={13} />}
                  onClick={handleCoverClick}
                  type="button"
                >
                  Trocar
                </Button>
                <Button
                  variant="danger"
                  size="sm"
                  iconLeft={<Trash2 size={13} />}
                  onClick={() => set('coverUrl', '')}
                  type="button"
                >
                  Remover
                </Button>
              </div>
            </div>
          ) : (
            <button
              type="button"
              onClick={handleCoverClick}
              className="w-full h-32 rounded-2xl border-2 border-dashed border-zinc-200 bg-zinc-50 hover:bg-zinc-100 hover:border-zinc-300 transition flex flex-col items-center justify-center gap-2 group"
            >
              <div className="w-10 h-10 rounded-xl bg-white border border-zinc-200 flex items-center justify-center group-hover:border-zinc-300 transition">
                <Upload size={18} className="text-zinc-400" />
              </div>
              <div className="text-center">
                <p className="text-xs font-bold text-zinc-600">Clique para subir a imagem de capa</p>
                <p className="text-[11px] text-zinc-400 mt-0.5">Recomendado: 1200×600px</p>
              </div>
            </button>
          )}
        </div>

        <Divider />

        {/* Título */}
        <Input
          label="Título do Evento *"
          placeholder="Ex: Workshop de Mindfulness para Terapeutas"
          value={form.title}
          onChange={e => set('title', e.target.value)}
          required
        />

        {/* Data e Hora */}
        <FormRow cols={2}>
          <DatePicker
            label="Data *"
            value={form.date || null}
            onChange={v => set('date', v ?? '')}
            min={new Date().toISOString().split('T')[0]}
          />
          <Input
            label="Hora *"
            type="time"
            value={form.time}
            onChange={e => set('time', e.target.value)}
            required
          />
        </FormRow>

        {/* Categoria */}
        <Select
          label="Categoria *"
          value={form.category}
          onChange={e => set('category', e.target.value as typeof CATEGORIES[number])}
          options={CATEGORIES.map(c => ({ value: c, label: `${CAT_META[c]?.icon ?? ''} ${c}` }))}
        />

        {/* Localização */}
        <Input
          label="Localização *"
          placeholder="Ex: Clínica Melodias — Rua das Flores, 123"
          value={form.location}
          onChange={e => set('location', e.target.value)}
          iconLeft={<MapPin size={14} />}
          required
        />

        {/* Link do mapa */}
        <Input
          label="Link para Mapa (opcional)"
          placeholder="Link do Google Maps"
          type="url"
          value={form.mapLink}
          onChange={e => set('mapLink', e.target.value)}
          iconLeft={<Link2 size={14} />}
        />

        {/* Descrição */}
        <Textarea
          label="Descrição / Pauta"
          placeholder="Descreva o que os participantes vão aprender ou praticar..."
          value={form.description}
          onChange={e => set('description', e.target.value)}
          rows={4}
        />

        <Divider />

        {/* Ferramentas interativas */}
        <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-4 space-y-4">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-base">🎁</span>
            <p className="text-[11px] font-black text-zinc-600 uppercase tracking-widest">Ferramentas Interativas</p>
          </div>

          {/* RSVP */}
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-sm font-bold text-zinc-800">Confirmação de Presença (RSVP)</p>
              <p className="text-[11px] text-zinc-400 mt-0.5">Permite que membros se inscrevam no evento</p>
            </div>
            <Switch
              checked={form.rsvp}
              onCheckedChange={v => set('rsvp', v)}
            />
          </div>

          <Divider />

          {/* Permitir acompanhantes */}
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-sm font-bold text-zinc-800">Permitir acompanhantes</p>
              <p className="text-[11px] text-zinc-400 mt-0.5">Participantes podem levar um convidado</p>
            </div>
            <Switch
              checked={form.allowGuests}
              onCheckedChange={v => set('allowGuests', v)}
            />
          </div>

          <Divider />

          {/* Divisão de itens */}
          <div className="space-y-3">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-bold text-zinc-800">Divisão de Itens / Organização</p>
                <p className="text-[11px] text-zinc-400 mt-0.5">Ex: café da manhã compartilhado, material de workshop</p>
              </div>
              <Switch
                checked={form.itemDivision}
                onCheckedChange={v => {
                  set('itemDivision', v);
                  if (!v) {
                    set('selectedListId', '');
                    set('divisionItems', []);
                  }
                }}
              />
            </div>

            {form.itemDivision && (
              <div className="space-y-3 pt-1">
                {/* Seletor de lista */}
                <div className="flex gap-2 items-end">
                  <Select
                    label="Lista pré-definida"
                    value={form.selectedListId || '__none__'}
                    onChange={e => handleSelectList(e.target.value)}
                    wrapperClassName="flex-1"
                    options={[
                      { value: '__none__', label: 'Sem lista / criar do zero' },
                      ...lists.map(l => ({ value: l.id, label: l.name })),
                    ]}
                  />
                  <Button
                    variant="ghost"
                    size="sm"
                    type="button"
                    onClick={onOpenManageLists}
                    className="shrink-0 mb-0.5"
                  >
                    Gerenciar Listas
                  </Button>
                </div>

                {/* Itens */}
                <div className="space-y-2">
                  {form.divisionItems.map((item, idx) => (
                    <div key={idx} className="flex gap-2 items-center">
                      <Input
                        placeholder={`Item ${idx + 1}`}
                        value={item}
                        onChange={e => updateDivisionItem(idx, e.target.value)}
                        wrapperClassName="flex-1"
                      />
                      <IconButton
                        variant="danger"
                        size="sm"
                        type="button"
                        onClick={() => removeDivisionItem(idx)}
                        title="Remover item"
                      >
                        <Trash2 size={13} />
                      </IconButton>
                    </div>
                  ))}

                  <Button
                    variant="ghost"
                    size="sm"
                    type="button"
                    iconLeft={<Plus size={13} />}
                    onClick={addDivisionItem}
                  >
                    + Adicionar Outro Item
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>

      </form>
    </Modal>
  );
}

// ─── Modal de Gestão do Evento ────────────────────────────────────────────────

interface EventManageModalProps {
  isOpen: boolean;
  onClose: () => void;
  event: HealthEvent;
  onDeleted: () => void;
  onUpdated: () => void;
}

function EventManageModal({ isOpen, onClose, event, onDeleted, onUpdated }: EventManageModalProps) {
  const toast = useToast();
  const [activeTab, setActiveTab] = useState<'attendance' | 'items' | 'edit'>('attendance');

  // Aba Presença
  const [rsvps, setRsvps] = useState<RsvpRow[]>([]);
  const [loadingRsvps, setLoadingRsvps] = useState(false);
  const [rsvpSearch, setRsvpSearch] = useState('');
  const [rsvpFilter, setRsvpFilter] = useState<'all' | 'present' | 'absent' | 'external'>('all');
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const [confirmDeleteRsvpId, setConfirmDeleteRsvpId] = useState<string | null>(null);

  // Aba Itens
  const [eventItemsList, setEventItemsList] = useState<Array<{ id: string; name: string }>>([]);
  const [loadingItems, setLoadingItems] = useState(false);
  const [newItemName, setNewItemName] = useState('');
  const [addingItem, setAddingItem] = useState(false);
  const [confirmDeleteItemId, setConfirmDeleteItemId] = useState<string | null>(null);

  // Aba Editar
  const [editForm, setEditForm] = useState({
    title: event.title,
    date: event.event_date ? event.event_date.slice(0, 10) : '',
    time: event.event_time ?? '',
    category: event.category,
    location: event.location ?? '',
    mapLink: event.map_link ?? '',
    description: event.description ?? '',
  });
  const [saving, setSaving] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // Resetar ao abrir
  useEffect(() => {
    if (isOpen) {
      setActiveTab('attendance');
      setRsvpSearch('');
      setRsvpFilter('all');
      setEditForm({
        title: event.title,
        date: event.event_date ? event.event_date.slice(0, 10) : '',
        time: event.event_time ?? '',
        category: event.category,
        location: event.location ?? '',
        mapLink: event.map_link ?? '',
        description: event.description ?? '',
      });
    }
  }, [isOpen, event]);

  // Carregar RSVPs ao abrir a aba presença
  useEffect(() => {
    if (!isOpen) return;
    setLoadingRsvps(true);
    eventsApi.listRsvps(event.id)
      .then(rows => setRsvps(rows as unknown as RsvpRow[]))
      .catch(() => toast.error('Erro ao carregar inscrições.'))
      .finally(() => setLoadingRsvps(false));
  }, [isOpen, event.id]);

  // Carregar itens do evento ao abrir o modal
  const loadItems = useCallback(() => {
    setLoadingItems(true);
    eventsApi.get(event.id)
      .then(full => setEventItemsList(full.items ?? []))
      .catch(() => toast.error('Erro ao carregar itens.'))
      .finally(() => setLoadingItems(false));
  }, [event.id, toast]);

  useEffect(() => {
    if (!isOpen) return;
    loadItems();
  }, [isOpen, loadItems]);

  async function handleAddItem() {
    if (!newItemName.trim()) return;
    setAddingItem(true);
    try {
      await eventsApi.addItem(event.id, newItemName.trim());
      setNewItemName('');
      toast.success('Item adicionado.');
      loadItems();
    } catch {
      toast.error('Erro ao adicionar item.');
    } finally {
      setAddingItem(false);
    }
  }

  async function handleDeleteItem(itemId: string) {
    try {
      await eventsApi.deleteItem(event.id, itemId);
      toast.success('Item removido.');
      loadItems();
    } catch {
      toast.error('Erro ao remover item.');
    } finally {
      setConfirmDeleteItemId(null);
    }
  }

  // ── Derived stats ──
  const totalConfirmed = rsvps.length;
  const totalPresent = rsvps.filter(r => r.attendance === 'present').length;
  const totalAbsent = rsvps.filter(r => r.attendance === 'absent').length;
  const totalGuests = rsvps.reduce((acc, r) => acc + (r.guests ?? 0), 0);

  // ── Filtro de RSVPs ──
  const filteredRsvps = rsvps.filter(r => {
    const matchSearch = !rsvpSearch || r.name?.toLowerCase().includes(rsvpSearch.toLowerCase());
    const matchFilter =
      rsvpFilter === 'all' ? true :
      rsvpFilter === 'present' ? r.attendance === 'present' :
      rsvpFilter === 'absent' ? r.attendance === 'absent' :
      /* external */ r.user_id === null;
    return matchSearch && matchFilter;
  });

  // ── Toggle presença ──
  async function toggleAttendance(rsvp: RsvpRow) {
    const next: RsvpRow['attendance'] = rsvp.attendance === 'present' ? 'absent' : 'present';
    setTogglingId(rsvp.id);
    try {
      const token = tokenStore.get();
      const res = await fetch(
        `http://localhost:3001/api/events/${event.id}/rsvps/${rsvp.id}`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          body: JSON.stringify({ attendance: next }),
        },
      );
      if (!res.ok) throw new Error('Falha ao atualizar presença.');
      setRsvps(prev => prev.map(r => r.id === rsvp.id ? { ...r, attendance: next } : r));
      toast.success(next === 'present' ? 'Marcado como presente.' : 'Marcado como falta.');
    } catch {
      toast.error('Erro ao atualizar presença.');
    } finally {
      setTogglingId(null);
    }
  }

  // ── Deletar RSVP ──
  async function deleteRsvp(rsvpId: string) {
    try {
      const token = tokenStore.get();
      const res = await fetch(
        `http://localhost:3001/api/events/${event.id}/rsvps/${rsvpId}`,
        {
          method: 'DELETE',
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        },
      );
      if (!res.ok) throw new Error('Falha ao remover inscrição.');
      setRsvps(prev => prev.filter(r => r.id !== rsvpId));
      toast.success('Inscrição removida.');
    } catch {
      toast.error('Erro ao remover inscrição.');
    }
    setConfirmDeleteRsvpId(null);
  }

  // ── Salvar edição ──
  async function saveEdit() {
    if (!editForm.title.trim()) { toast.error('Informe o título.'); return; }
    setSaving(true);
    try {
      await eventsApi.update(event.id, {
        title: editForm.title.trim(),
        date: editForm.date,
        time: editForm.time,
        category: editForm.category,
        description: editForm.description.trim(),
        location: editForm.location.trim(),
        mapLink: editForm.mapLink.trim(),
      });
      toast.success('Evento atualizado!');
      onUpdated();
    } catch {
      toast.error('Erro ao salvar alterações.');
    } finally {
      setSaving(false);
    }
  }

  // ── Deletar evento ──
  async function deleteEvent() {
    setDeleting(true);
    try {
      await eventsApi.delete(event.id);
      toast.success('Evento excluído.');
      onDeleted();
      onClose();
    } catch {
      toast.error('Erro ao excluir evento.');
    } finally {
      setDeleting(false);
      setConfirmDelete(false);
    }
  }

  // ── Itens do evento — construídos a partir dos RSVPs (com item_name do JOIN) ──
  const eventItemsMap = new Map<string, { id: string; name: string; takers: string[] }>();
  rsvps.forEach(r => {
    if (r.item_id && r.item_name) {
      if (!eventItemsMap.has(r.item_id)) {
        eventItemsMap.set(r.item_id, { id: r.item_id, name: r.item_name, takers: [] });
      }
      eventItemsMap.get(r.item_id)!.takers.push(r.name);
    }
  });
  // Itens sem ninguém: vem da lista completa carregada via eventsApi.get()
  eventItemsList.forEach(i => {
    if (!eventItemsMap.has(i.id)) {
      eventItemsMap.set(i.id, { id: i.id, name: i.name, takers: [] });
    }
  });
  const eventItems = Array.from(eventItemsMap.values());
  const filledItems = eventItems.filter(it => it.takers.length > 0).length;

  const TABS = [
    { key: 'attendance' as const, label: 'Presença' },
    { key: 'items'      as const, label: 'Itens' },
    { key: 'edit'       as const, label: 'Editar' },
  ];

  return (
    <>
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        title="Gestão do Evento"
        size="2xl"
        mobileStyle="bottom-sheet"
        footer={
          <ModalFooter>
            <Button variant="outline" onClick={onClose}>Fechar</Button>
            {activeTab === 'edit' && (
              <Button variant="success" loading={saving} onClick={saveEdit}>
                Salvar alterações
              </Button>
            )}
          </ModalFooter>
        }
      >
        {/* Cabeçalho do evento */}
        <div className="mb-4 p-3 bg-zinc-50 rounded-xl border border-zinc-200">
          <p className="text-sm font-bold text-zinc-800 leading-snug">{event.title}</p>
          <div className="flex flex-wrap gap-3 mt-1.5 text-[11px] text-zinc-400">
            <span className="flex items-center gap-1">
              <Calendar size={11} />
              {event.event_date
                ? new Date(event.event_date).toLocaleDateString('pt-BR', { weekday: 'short', day: '2-digit', month: 'long', year: 'numeric' })
                : '—'}
            </span>
            <span className="flex items-center gap-1">
              <Clock size={11} />{event.event_time ?? '—'}
            </span>
            {event.location && (
              <span className="flex items-center gap-1">
                <MapPin size={11} />{event.location}
              </span>
            )}
          </div>
        </div>

        {/* Tabs internas */}
        <div className="flex gap-1 bg-zinc-100 rounded-xl p-1 mb-5">
          {TABS.map(t => (
            <button
              key={t.key}
              onClick={() => setActiveTab(t.key)}
              className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition ${
                activeTab === t.key
                  ? 'bg-white text-zinc-900 shadow-sm'
                  : 'text-zinc-500 hover:text-zinc-700'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* ── ABA PRESENÇA ── */}
        {activeTab === 'attendance' && (
          <div className="space-y-4">
            {/* Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {[
                { label: 'Confirmados', value: totalConfirmed, color: 'text-brand-moss' },
                { label: 'Presentes',   value: totalPresent,   color: 'text-emerald-600' },
                { label: 'Faltas',      value: totalAbsent,    color: 'text-red-500' },
                { label: 'Acompanhantes', value: totalGuests,  color: 'text-violet-600' },
              ].map(s => (
                <div key={s.label} className="bg-zinc-50 border border-zinc-200 rounded-xl p-3 text-center">
                  <p className={`text-xl font-black ${s.color}`}>{s.value}</p>
                  <p className="text-[10px] text-zinc-400 font-semibold uppercase tracking-wide mt-0.5">{s.label}</p>
                </div>
              ))}
            </div>

            {/* Filtros */}
            <div className="flex flex-col sm:flex-row gap-2">
              <div className="relative flex-1">
                <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none" />
                <input
                  className="w-full pl-8 pr-3 py-2 text-xs rounded-xl border border-zinc-200 bg-white outline-none focus:ring-2 focus:ring-brand-moss/30 focus:border-brand-moss"
                  placeholder="Buscar por nome..."
                  value={rsvpSearch}
                  onChange={e => setRsvpSearch(e.target.value)}
                />
              </div>
              <div className="flex gap-1 bg-zinc-100 rounded-xl p-1 shrink-0">
                {([
                  { key: 'all'     , label: 'Todos' },
                  { key: 'present' , label: 'Presentes' },
                  { key: 'absent'  , label: 'Faltas' },
                  { key: 'external', label: 'Externos' },
                ] as { key: typeof rsvpFilter; label: string }[]).map(f => (
                  <button
                    key={f.key}
                    onClick={() => setRsvpFilter(f.key)}
                    className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition ${
                      rsvpFilter === f.key ? 'bg-white text-zinc-900 shadow-sm' : 'text-zinc-500 hover:text-zinc-700'
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Lista de RSVPs */}
            {loadingRsvps ? (
              <div className="flex items-center justify-center py-10 gap-2 text-zinc-400 text-sm">
                <RefreshCw size={14} className="animate-spin" /> Carregando inscrições...
              </div>
            ) : filteredRsvps.length === 0 ? (
              <EmptyState icon={Users} title="Nenhuma inscrição encontrada" description="Sem resultados para o filtro selecionado." />
            ) : (
              <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                {filteredRsvps.map(rsvp => {
                  const isExternal = rsvp.user_id === null;
                  const isPresent  = rsvp.attendance === 'present';
                  const isAbsent   = rsvp.attendance === 'absent';
                  const phone = rsvp.phone?.replace(/\D/g, '') ?? '';
                  return (
                    <div
                      key={rsvp.id}
                      className="flex items-start gap-3 p-3 rounded-xl border border-zinc-100 bg-white hover:bg-zinc-50 transition"
                    >
                      {/* Avatar inicial */}
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-brand-clay/20 to-brand-moss/20 flex items-center justify-center shrink-0 mt-0.5">
                        <span className="text-xs font-black text-brand-navy">
                          {rsvp.name?.charAt(0).toUpperCase() ?? '?'}
                        </span>
                      </div>

                      {/* Nome + dados */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="text-xs font-bold text-zinc-800">{rsvp.name || '—'}</span>
                          {isExternal && (
                            <span className="text-[9px] font-bold bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded-full">Ext.</span>
                          )}
                        </div>
                        {phone && (
                          <p className="text-[10px] text-zinc-400 mt-0.5">{rsvp.phone}</p>
                        )}
                        {rsvp.item_name && (
                          <div className="flex items-center gap-1 mt-1">
                            <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded-full">
                              🧺 {rsvp.item_name}
                            </span>
                          </div>
                        )}
                        {rsvp.guests > 0 && (
                          <p className="text-[10px] text-violet-600 font-semibold mt-0.5">+{rsvp.guests} acompanhante{rsvp.guests > 1 ? 's' : ''}</p>
                        )}
                        {rsvp.observation && (
                          <p className="text-[10px] text-zinc-400 italic mt-0.5">"{rsvp.observation}"</p>
                        )}
                      </div>

                      {/* Status badge */}
                      <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full shrink-0 ${
                        isPresent ? 'bg-emerald-100 text-emerald-700' :
                        isAbsent  ? 'bg-red-100 text-red-600' :
                                    'bg-zinc-100 text-zinc-500'
                      }`}>
                        {isPresent ? 'Presente' : isAbsent ? 'Falta' : 'Confirmado'}
                      </span>

                      {/* Ações */}
                      <div className="flex gap-1.5 shrink-0">
                        {phone && (
                          <IconButton
                            size="sm"
                            variant="ghost"
                            title="Enviar WhatsApp"
                            onClick={() => window.open(`https://wa.me/55${phone}`, '_blank')}
                          >
                            <MessageCircle size={12} />
                          </IconButton>
                        )}
                        <button
                          type="button"
                          onClick={() => toggleAttendance(rsvp)}
                          disabled={togglingId === rsvp.id}
                          title={isPresent ? 'Marcar falta' : 'Marcar presente'}
                          className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[10px] font-bold transition disabled:opacity-50 ${
                            isPresent
                              ? 'bg-red-50 text-red-600 hover:bg-red-100 border border-red-200'
                              : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200'
                          }`}
                        >
                          {togglingId === rsvp.id
                            ? <RefreshCw size={12} className="animate-spin" />
                            : isPresent
                              ? <UserX size={12} />
                              : <Check size={12} />
                          }
                          {isPresent ? 'Marcar falta' : 'Marcar presente'}
                        </button>
                        <IconButton
                          size="sm"
                          variant="danger"
                          title="Remover inscrição"
                          onClick={() => setConfirmDeleteRsvpId(rsvp.id)}
                        >
                          <Trash2 size={12} />
                        </IconButton>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ── ABA ITENS ── */}
        {activeTab === 'items' && (
          <div className="space-y-4">
            {/* Adicionar novo item */}
            <div className="flex gap-2">
              <Input
                placeholder="Ex: Café, Bolo, Copos descartáveis..."
                value={newItemName}
                onChange={e => setNewItemName(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleAddItem()}
                wrapperClassName="flex-1"
              />
              <Button
                variant="success"
                iconLeft={<Plus size={14} />}
                onClick={handleAddItem}
                loading={addingItem}
              >
                Adicionar
              </Button>
            </div>

            {loadingItems ? (
              <div className="flex items-center justify-center py-8 gap-2 text-zinc-400 text-sm">
                <RefreshCw size={14} className="animate-spin" /> Carregando itens...
              </div>
            ) : eventItems.length === 0 ? (
              <EmptyState icon={Package} title="Sem itens" description="Adicione itens para os participantes se organizarem (ex: lista de café)." />
            ) : (
              <>
                <div className="flex items-center justify-between">
                  <p className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider">Itens do evento</p>
                  <span className="text-[11px] font-bold text-zinc-600">
                    {filledItems} de {eventItems.length} itens preenchidos
                  </span>
                </div>
                <div className="space-y-2">
                  {eventItems.map(item => {
                    const hasTakers = item.takers.length > 0;
                    return (
                      <div
                        key={item.id}
                        className={`rounded-xl border p-3 transition ${
                          hasTakers
                            ? 'border-emerald-200 bg-emerald-50/50'
                            : 'border-zinc-200 bg-white'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <div className="flex items-center gap-2">
                            <span className={`w-2 h-2 rounded-full shrink-0 ${hasTakers ? 'bg-emerald-500' : 'bg-zinc-300'}`} />
                            <p className="text-xs font-bold text-zinc-800">{item.name}</p>
                          </div>
                          <div className="flex items-center gap-1.5 shrink-0">
                            <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${
                              hasTakers ? 'bg-emerald-100 text-emerald-700' : 'bg-zinc-100 text-zinc-500'
                            }`}>
                              {hasTakers ? `${item.takers.length} pessoa${item.takers.length > 1 ? 's' : ''}` : 'Vago'}
                            </span>
                            <IconButton
                              size="sm"
                              variant="danger"
                              title="Remover item"
                              onClick={() => setConfirmDeleteItemId(item.id)}
                            >
                              <Trash2 size={12} />
                            </IconButton>
                          </div>
                        </div>
                        {hasTakers ? (
                          <div className="flex flex-wrap gap-1.5 ml-4">
                            {item.takers.map((taker, ti) => (
                              <span key={ti} className="text-[10px] font-semibold bg-white text-emerald-700 px-2 py-0.5 rounded-full border border-emerald-200">
                                ✓ {taker}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <p className="text-[10px] text-zinc-400 ml-4">Ninguém se cadastrou ainda</p>
                        )}
                      </div>
                    );
                  })}
                </div>
              </>
            )}
          </div>
        )}

        {/* ── ABA EDITAR ── */}
        {activeTab === 'edit' && (
          <div className="space-y-4">
            <Input
              label="Título"
              value={editForm.title}
              onChange={e => setEditForm(p => ({ ...p, title: e.target.value }))}
            />
            <FormRow cols={2}>
              <DatePicker
                label="Data"
                value={editForm.date || null}
                onChange={v => setEditForm(p => ({ ...p, date: v ?? '' }))}
              />
              <Input
                label="Hora"
                type="time"
                value={editForm.time}
                onChange={e => setEditForm(p => ({ ...p, time: e.target.value }))}
              />
            </FormRow>
            <Select
              label="Categoria"
              value={editForm.category}
              onChange={e => setEditForm(p => ({ ...p, category: e.target.value }))}
              options={CATEGORIES.map(c => ({ value: c, label: `${CAT_META[c]?.icon ?? ''} ${c}` }))}
            />
            <Input
              label="Localização"
              value={editForm.location}
              onChange={e => setEditForm(p => ({ ...p, location: e.target.value }))}
              iconLeft={<MapPin size={14} />}
            />
            <Input
              label="Link do mapa"
              type="url"
              value={editForm.mapLink}
              onChange={e => setEditForm(p => ({ ...p, mapLink: e.target.value }))}
              iconLeft={<Link2 size={14} />}
            />
            <Textarea
              label="Descrição"
              value={editForm.description}
              onChange={e => setEditForm(p => ({ ...p, description: e.target.value }))}
              rows={4}
            />

            <Divider />

            <Button
              variant="danger"
              iconLeft={<Trash2 size={14} />}
              onClick={() => setConfirmDelete(true)}
              loading={deleting}
              className="w-full"
            >
              Excluir evento
            </Button>
          </div>
        )}
      </Modal>

      {/* Confirmar delete RSVP */}
      <ConfirmModal
        isOpen={!!confirmDeleteRsvpId}
        onClose={() => setConfirmDeleteRsvpId(null)}
        onConfirm={() => confirmDeleteRsvpId && deleteRsvp(confirmDeleteRsvpId)}
        title="Remover inscrição"
        message="Esta inscrição será removida. Deseja continuar?"
        confirmLabel="Remover"
        variant="danger"
      />

      {/* Confirmar delete item */}
      <ConfirmModal
        isOpen={!!confirmDeleteItemId}
        onClose={() => setConfirmDeleteItemId(null)}
        onConfirm={() => confirmDeleteItemId && handleDeleteItem(confirmDeleteItemId)}
        title="Remover item"
        message="Este item será removido da lista. Quem já tinha escolhido levá-lo ficará sem item atribuído."
        confirmLabel="Remover"
        variant="danger"
      />

      {/* Confirmar delete evento */}
      <ConfirmModal
        isOpen={confirmDelete}
        onClose={() => setConfirmDelete(false)}
        onConfirm={deleteEvent}
        title="Excluir evento"
        message={`O evento "${event.title}" será excluído permanentemente. Deseja continuar?`}
        confirmLabel="Excluir"
        variant="danger"
      />
    </>
  );
}

// ─── Componente principal ─────────────────────────────────────────────────────

export default function EventsView() {
  const { user } = useAuth();
  const toast = useToast();

  const [events, setEvents]         = useState<HealthEvent[]>([]);
  const [loading, setLoading]       = useState(true);
  const [tab, setTab]               = useState<'upcoming' | 'past'>('upcoming');
  const [enrollingId, setEnrollingId] = useState<string | null>(null);

  // Modals
  const [showCreate, setShowCreate]         = useState(false);
  const [showManageLists, setShowManageLists] = useState(false);
  const [linkModal, setLinkModal] = useState<{ id: string; title: string } | null>(null);
  const [manageEvent, setManageEvent] = useState<HealthEvent | null>(null);
  const [confirmDeleteEvent, setConfirmDeleteEvent] = useState<{ id: string; title: string } | null>(null);

  // Filtros aba passados
  const [pastSearch, setPastSearch] = useState('');
  const [pastYear, setPastYear]     = useState('');

  // Listas pré-definidas (backend)
  const [lists, setLists] = useState<ItemList[]>([]);

  const isAdmin = user?.role === 'super-admin' || user?.role === 'professional';

  // ── Carregar listas do backend ──
  useEffect(() => {
    if (!user) return;
    eventsApi.listItemLists()
      .then(setLists)
      .catch(() => {});
  }, [user]);

  // ── Carregar eventos ──
  const load = useCallback(() => {
    setLoading(true);
    eventsApi.list()
      .then(res => setEvents(res.data))
      .catch(() => toast.error('Não foi possível carregar os eventos.'))
      .finally(() => setLoading(false));
  }, [toast]);

  useEffect(() => { load(); }, [load]);

  const upcoming = events.filter(e => e.status === 'upcoming');
  const past     = events.filter(e => e.status === 'past');

  // ── Anos únicos dos eventos passados ──
  const pastYears = Array.from(new Set(
    past.map(e => e.event_date ? new Date(e.event_date).getFullYear().toString() : null).filter(Boolean) as string[]
  )).sort((a, b) => Number(b) - Number(a));

  // ── Eventos passados filtrados ──
  const filteredPast = past.filter(e => {
    const matchSearch = !pastSearch || e.title.toLowerCase().includes(pastSearch.toLowerCase());
    const matchYear   = !pastYear || (e.event_date && new Date(e.event_date).getFullYear().toString() === pastYear);
    return matchSearch && matchYear;
  });

  // ── Stats histórico ──
  const totalParticipations = past.reduce((acc, e) => acc + (e.participants_count ?? 0), 0);
  const avgParticipants     = past.length > 0 ? Math.round(totalParticipations / past.length) : 0;

  // ── Inscrição ──
  async function handleEnroll(id: string) {
    setEnrollingId(id);
    try {
      await eventsApi.enroll(id);
      setEvents(prev =>
        prev.map(e =>
          e.id === id
            ? { ...e, isEnrolled: true, participants_count: e.participants_count + 1 }
            : e
        )
      );
      toast.success('Inscrição confirmada!');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Erro ao se inscrever.';
      toast.error(msg);
    } finally {
      setEnrollingId(null);
    }
  }

  // ── Copiar link público ──
  function copyPublicLink(id: string) {
    const url = `${window.location.origin}/evento/${id}`;
    navigator.clipboard.writeText(url)
      .then(() => toast.success('Link copiado!'))
      .catch(() => toast.error('Não foi possível copiar o link.'));
  }

  // ── Deletar evento (inline nos cards) ──
  async function handleDeleteEvent(id: string) {
    try {
      await eventsApi.delete(id);
      setEvents(prev => prev.filter(e => e.id !== id));
      toast.success('Evento excluído.');
    } catch {
      toast.error('Erro ao excluir evento.');
    }
  }

  // ── Sucesso ao criar evento ──
  function handleCreateSuccess(eventId: string, eventTitle: string) {
    toast.success(`Evento "${eventTitle}" publicado!`);
    setLinkModal({ id: eventId, title: eventTitle });
    load();
  }

  return (
    <PageWrapper id="events-main-view">
      <div className="space-y-5 sm:space-y-6 animate-fadeIn">

        {/* ── HEADER ─────────────────────────────────────────────────────── */}
        <ContentCard padding="md" id="events-header">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="p-2.5 bg-brand-moss/10 rounded-xl shrink-0">
                <Calendar className="w-5 h-5 text-brand-moss" />
              </div>
              <div>
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="text-[10px] font-bold text-brand-moss uppercase tracking-widest">Agenda Melodias</span>
                  <span className="w-1.5 h-1.5 rounded-full bg-brand-moss animate-pulse" />
                </div>
                <h2 className="text-lg sm:text-xl font-serif font-bold text-brand-navy">
                  Encontros, Palestras & Workshops
                </h2>
                <p className="text-xs text-slate-400 mt-0.5 max-w-lg">
                  Participe dos nossos encontros presenciais mediados por psicólogos credenciados.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <IconButton
                variant="ghost"
                onClick={load}
                title="Atualizar"
                disabled={loading}
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              </IconButton>

              {isAdmin && (
                <Button
                  id="btn-trigger-add-event"
                  variant="success"
                  iconLeft={<Plus size={15} />}
                  onClick={() => setShowCreate(true)}
                >
                  Agendar Encontro
                </Button>
              )}
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-3 mt-5 pt-5 border-t border-brand-sand/60">
            {[
              { label: 'Próximos',  value: upcoming.length, color: 'text-brand-moss'  },
              { label: 'Realizados', value: past.length,    color: 'text-brand-clay'  },
              { label: 'Total',     value: events.length,   color: 'text-brand-navy'  },
            ].map(s => (
              <div key={s.label} className="text-center">
                <p className={`text-2xl font-black ${s.color}`}>{s.value}</p>
                <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mt-0.5">{s.label}</p>
              </div>
            ))}
          </div>
        </ContentCard>

        {/* ── TAB SWITCHER ───────────────────────────────────────────────── */}
        <div className="flex gap-1 bg-white border border-brand-sand/60 rounded-xl p-1 w-fit">
          {[
            { val: 'upcoming' as const, label: `Próximos (${upcoming.length})` },
            { val: 'past'     as const, label: `Realizados (${past.length})` },
          ].map(t => (
            <button
              key={t.val}
              id={`tab-events-${t.val}`}
              onClick={() => setTab(t.val)}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition ${
                tab === t.val
                  ? 'bg-brand-moss text-white shadow-sm'
                  : 'text-slate-500 hover:text-brand-navy'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* ── CONTEÚDO ───────────────────────────────────────────────────── */}
        {loading ? (
          <div className="flex items-center justify-center py-16 text-slate-400 text-sm gap-2">
            <RefreshCw className="w-4 h-4 animate-spin" />Carregando eventos...
          </div>
        ) : tab === 'upcoming' ? (

          upcoming.length === 0 ? (
            <EmptyState
              icon={Calendar}
              title="Nenhum encontro agendado"
              description="Ainda não há eventos próximos. Volte em breve!"
              action={
                isAdmin
                  ? (
                    <Button
                      variant="success"
                      iconLeft={<Plus size={14} />}
                      onClick={() => setShowCreate(true)}
                    >
                      Agendar o primeiro
                    </Button>
                  )
                  : undefined
              }
            />
          ) : (
            <div id="upcoming-events-grid" className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
              {upcoming.map(evt => {
                const meta = CAT_META[evt.category] ?? CAT_META['Grupo de Apoio'];
                const isEnrolling = enrollingId === evt.id;
                const divisionItems = evt.division_items ?? [];
                return (
                  <React.Fragment key={evt.id}>
                    <UpcomingEventCard
                      evt={evt}
                      meta={meta}
                      isEnrolling={isEnrolling}
                      isAdmin={isAdmin}
                      divisionItems={divisionItems}
                      onEnroll={() => handleEnroll(evt.id)}
                      onCopyLink={() => copyPublicLink(evt.id)}
                      onManage={() => setManageEvent(evt)}
                      onDelete={() => setConfirmDeleteEvent({ id: evt.id, title: evt.title })}
                    />
                  </React.Fragment>
                );
              })}
            </div>
          )

        ) : (

          /* PAST EVENTS */
          past.length === 0 ? (
            <EmptyState
              icon={Calendar}
              title="Nenhum evento encerrado"
              description="Os encontros já realizados aparecerão aqui."
            />
          ) : (
            <div className="space-y-5">
              {/* Stats histórico */}
              <StatGrid cols={3}>
                <StatCard
                  title="Eventos realizados"
                  value={past.length}
                  icon={Calendar}
                  color="info"
                  delay={0}
                />
                <StatCard
                  title="Participações confirmadas"
                  value={totalParticipations}
                  icon={Users}
                  color="success"
                  delay={0.05}
                />
                <StatCard
                  title="Média por evento"
                  value={avgParticipants}
                  icon={TrendingUp}
                  color="purple"
                  delay={0.1}
                />
              </StatGrid>

              {/* Filtros */}
              <div className="flex flex-col sm:flex-row gap-2">
                <div className="relative flex-1">
                  <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none" />
                  <input
                    className="w-full pl-8 pr-3 py-2 text-xs rounded-xl border border-zinc-200 bg-white outline-none focus:ring-2 focus:ring-brand-moss/30 focus:border-brand-moss"
                    placeholder="Buscar por título..."
                    value={pastSearch}
                    onChange={e => setPastSearch(e.target.value)}
                  />
                </div>
                {pastYears.length > 0 && (
                  <select
                    className="px-3 py-2 text-xs rounded-xl border border-zinc-200 bg-white outline-none focus:ring-2 focus:ring-brand-moss/30 focus:border-brand-moss shrink-0"
                    value={pastYear}
                    onChange={e => setPastYear(e.target.value)}
                  >
                    <option value="">Todos os anos</option>
                    {pastYears.map(y => (
                      <option key={y} value={y}>{y}</option>
                    ))}
                  </select>
                )}
              </div>

              {filteredPast.length === 0 ? (
                <EmptyState icon={Search} title="Nenhum resultado" description="Nenhum evento encontrado para o filtro selecionado." />
              ) : (
                <div id="past-events-grid" className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
                  {filteredPast.map(evt => (
                    <React.Fragment key={evt.id}>
                      <PastEventCard
                        evt={evt}
                        isAdmin={isAdmin}
                        onManage={() => setManageEvent(evt)}
                        onDelete={() => setConfirmDeleteEvent({ id: evt.id, title: evt.title })}
                        onCopyLink={() => copyPublicLink(evt.id)}
                      />
                    </React.Fragment>
                  ))}
                </div>
              )}
            </div>
          )
        )}

        {/* ── FOOTER CALLOUT ─────────────────────────────────────────────── */}
        <div
          id="events-callout"
          className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-brand-navy to-brand-navy-dark border border-brand-navy-light/20 p-5 sm:p-6 text-center"
        >
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-2 right-8 text-6xl font-script text-brand-clay/15 select-none">♩</div>
            <div className="absolute bottom-2 left-8 text-5xl font-script text-brand-moss/15 select-none">♫</div>
          </div>
          <div className="relative z-10">
            <Music2 className="w-6 h-6 text-brand-clay-light mx-auto mb-2" />
            <p className="font-script text-2xl text-brand-clay-light mb-1">Cada encontro é uma nota.</p>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              Juntos, formamos uma grande sinfonia de cuidado e pertencimento.
            </p>
          </div>
        </div>

      </div>

      {/* ── MODALS ─────────────────────────────────────────────────────────── */}

      <CreateEventModal
        isOpen={showCreate}
        onClose={() => setShowCreate(false)}
        onSuccess={handleCreateSuccess}
        lists={lists}
        onOpenManageLists={() => {
          // Abre gerenciar listas SEM fechar o modal de criação
          // O z-index do segundo modal sobrepõe o primeiro
          setShowManageLists(true);
        }}
      />

      <ManageListsModal
        isOpen={showManageLists}
        onClose={() => {
          setShowManageLists(false);
          // Recarrega as listas para o formulário de criação ter as novas listas disponíveis
          eventsApi.listItemLists().then(setLists).catch(() => {});
        }}
        lists={lists}
        onRefresh={() => eventsApi.listItemLists().then(setLists).catch(() => {})}
      />

      {linkModal && (
        <EventLinkModal
          isOpen={!!linkModal}
          onClose={() => setLinkModal(null)}
          eventId={linkModal.id}
          eventTitle={linkModal.title}
        />
      )}

      <ConfirmModal
        isOpen={!!confirmDeleteEvent}
        onClose={() => setConfirmDeleteEvent(null)}
        onConfirm={() => {
          if (confirmDeleteEvent) handleDeleteEvent(confirmDeleteEvent.id);
          setConfirmDeleteEvent(null);
        }}
        title="Excluir evento"
        message={`O evento "${confirmDeleteEvent?.title}" será excluído. Deseja continuar?`}
        variant="danger"
        confirmLabel="Excluir"
      />

      {manageEvent && (
        <EventManageModal
          isOpen={!!manageEvent}
          onClose={() => setManageEvent(null)}
          event={manageEvent}
          onDeleted={() => {
            setEvents(prev => prev.filter(e => e.id !== manageEvent.id));
            setManageEvent(null);
          }}
          onUpdated={() => {
            load();
            setManageEvent(null);
          }}
        />
      )}

    </PageWrapper>
  );
}

// ─── Card de evento próximo ───────────────────────────────────────────────────

interface UpcomingEventCardProps {
  evt: HealthEvent;
  meta: { color: 'success' | 'info' | 'warning' | 'purple'; icon: string };
  isEnrolling: boolean;
  isAdmin: boolean;
  divisionItems: Array<{ name: string; takers?: string[] }>;
  onEnroll: () => void;
  onCopyLink: () => void;
  onManage: () => void;
  onDelete: () => void;
}

function UpcomingEventCard({
  evt, meta, isEnrolling, isAdmin, divisionItems,
  onEnroll, onCopyLink, onManage, onDelete,
}: UpcomingEventCardProps) {
  const coverUrl = evt.cover_url;
  const location = evt.location;

  const catGradient: Record<string, string> = {
    success: 'from-brand-moss to-brand-moss-dark',
    info:    'from-brand-navy to-brand-navy-dark',
    warning: 'from-brand-clay to-brand-clay-dark',
    purple:  'from-brand-moss-dark to-brand-navy-dark',
  };
  const gradient = catGradient[meta.color] ?? catGradient.success;

  // Formata data sem "Invalid Date"
  const dateStr = (() => {
    const d = evt.event_date;
    const iso = typeof d === 'string' && d.includes('T') ? d.split('T')[0] : String(d);
    const [y, m, day] = iso.split('-').map(Number);
    return new Date(y, m - 1, day).toLocaleDateString('pt-BR', { weekday: 'short', day: '2-digit', month: 'short' });
  })();

  return (
    <div
      id={`event-card-${evt.id}`}
      className="bg-white rounded-2xl sm:rounded-3xl overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-200 flex flex-col group border border-zinc-100"
    >
      {/* CAPA / HERO */}
      {coverUrl ? (
        <div className="relative h-64 overflow-hidden bg-zinc-100">
          <img src={coverUrl} alt={evt.title} className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-500" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
          {/* Badges sobre a imagem */}
          <div className="absolute top-3 left-3 right-3 flex items-start justify-between">
            <span className="text-[10px] font-black text-white bg-black/30 backdrop-blur-sm px-2.5 py-1 rounded-full border border-white/20">
              {meta.icon} {evt.category}
            </span>
            <span className="flex items-center gap-1 text-[10px] font-bold text-white bg-black/30 backdrop-blur-sm px-2 py-1 rounded-full">
              <Users size={9} />{evt.participants_count}
            </span>
          </div>
          {/* Ações admin sobre imagem */}
          {isAdmin && (
            <div className="absolute bottom-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <IconButton size="xs" variant="ghost" title="Gestão" onClick={onManage} className="bg-white/90 border-0 hover:bg-white">
                <BarChart2 size={11} />
              </IconButton>
              <IconButton size="xs" variant="ghost" title="Copiar link" onClick={onCopyLink} className="bg-white/90 border-0 hover:bg-white">
                <Link2 size={11} />
              </IconButton>
              <IconButton size="xs" variant="ghost" title="Editar" onClick={onManage} className="bg-white/90 border-0 hover:bg-white">
                <Pencil size={11} />
              </IconButton>
              <IconButton size="xs" variant="danger" title="Excluir" onClick={onDelete} className="bg-white/90 border-0">
                <Trash2 size={11} />
              </IconButton>
            </div>
          )}
        </div>
      ) : (
        /* Sem imagem: hero colorido com título */
        <div className={`relative bg-gradient-to-br ${gradient} p-5 overflow-hidden`}>
          <div className="absolute top-0 right-0 w-32 h-32 rounded-full bg-white/5 -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-20 h-20 rounded-full bg-black/10 translate-y-1/2 -translate-x-1/2" />
          <div className="relative z-10">
            <div className="flex items-start justify-between mb-3">
              <span className="text-[10px] font-black text-white/80 bg-white/15 px-2.5 py-1 rounded-full">
                {meta.icon} {evt.category}
              </span>
              <span className="flex items-center gap-1 text-[10px] font-bold text-white/70">
                <Users size={9} />{evt.participants_count}
              </span>
            </div>
            <h3 className="text-base font-black text-white leading-tight line-clamp-2">{evt.title}</h3>
          </div>
          {/* Ações admin no hero sem capa */}
          {isAdmin && (
            <div className="absolute bottom-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <IconButton size="xs" variant="ghost" title="Gestão" onClick={onManage} className="bg-white/20 border-0 text-white hover:bg-white/30">
                <BarChart2 size={11} />
              </IconButton>
              <IconButton size="xs" variant="ghost" title="Copiar link" onClick={onCopyLink} className="bg-white/20 border-0 text-white hover:bg-white/30">
                <Link2 size={11} />
              </IconButton>
              <IconButton size="xs" variant="ghost" title="Editar" onClick={onManage} className="bg-white/20 border-0 text-white hover:bg-white/30">
                <Pencil size={11} />
              </IconButton>
              <IconButton size="xs" variant="danger" title="Excluir" onClick={onDelete} className="bg-white/20 border-0">
                <Trash2 size={11} />
              </IconButton>
            </div>
          )}
        </div>
      )}

      <div className="p-4 flex flex-col flex-1 gap-3">
        {/* Título (só aparece aqui quando tem capa) */}
        {coverUrl && (
          <h3 className="text-sm font-black text-brand-navy leading-snug group-hover:text-brand-moss transition line-clamp-2">
            {evt.title}
          </h3>
        )}

        {/* Data / hora / local em linha */}
        <div className="flex flex-wrap gap-x-3 gap-y-1">
          <span className="flex items-center gap-1.5 text-[11px] font-semibold text-brand-moss">
            <Calendar size={11} className="shrink-0" />{dateStr}
          </span>
          <span className="flex items-center gap-1.5 text-[11px] text-slate-500">
            <Clock size={11} className="shrink-0" />{evt.event_time}
          </span>
          {location && (
            <span className="flex items-center gap-1.5 text-[11px] text-slate-500 truncate max-w-[160px]">
              <MapPin size={11} className="shrink-0" />{location}
            </span>
          )}
        </div>

        {/* Instrutor */}
        <div className="flex items-center gap-2">
          {evt.instructor_avatar ? (
            <img src={evt.instructor_avatar} alt={evt.instructor_name} className="w-5 h-5 rounded-full object-cover" />
          ) : (
            <div className="w-5 h-5 rounded-full bg-brand-sand flex items-center justify-center shrink-0">
              <span className="text-[9px] font-black text-brand-clay">{evt.instructor_name.charAt(0)}</span>
            </div>
          )}
          <span className="text-[11px] text-slate-500 font-medium truncate">{evt.instructor_name}</span>
        </div>

        {/* Descrição */}
        {evt.description && (
          <p className="text-[11px] text-slate-400 leading-relaxed line-clamp-2">{evt.description}</p>
        )}

        {/* Divisão de itens */}
        {divisionItems.length > 0 && (
          <div className="rounded-xl bg-amber-50 border border-amber-100 p-2.5">
            <p className="text-[9px] font-black text-amber-700 uppercase tracking-widest mb-1.5">🧺 Itens do encontro</p>
            <div className="flex flex-wrap gap-1.5">
              {divisionItems.slice(0, 4).map((item, i) => (
                <span key={i} className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${
                  item.takers?.length
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200 line-through'
                    : 'bg-white text-amber-700 border-amber-200'
                }`}>
                  {item.name}
                </span>
              ))}
              {divisionItems.length > 4 && (
                <span className="text-[10px] text-amber-500 font-semibold">+{divisionItems.length - 4}</span>
              )}
            </div>
          </div>
        )}

        {/* Rodapé: link público + inscrição */}
        <div className="flex items-center justify-between pt-3 border-t border-zinc-100 mt-auto gap-2">
          {isAdmin ? (
            <button onClick={onCopyLink} className="flex items-center gap-1 text-[10px] text-slate-400 hover:text-brand-moss transition font-semibold">
              <Copy size={10} />Link público
            </button>
          ) : <span />}

          {evt.isEnrolled ? (
            <span className="flex items-center gap-1.5 text-[11px] font-black text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-xl">
              <Check size={12} />Confirmado
            </span>
          ) : (
            <Button
              id={`btn-enroll-${evt.id}`}
              variant="success"
              size="sm"
              loading={isEnrolling}
              iconLeft={isEnrolling ? undefined : <ChevronRight size={13} />}
              onClick={onEnroll}
            >
              {isEnrolling ? 'Inscrevendo...' : 'Inscrever-se'}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Card de evento passado ───────────────────────────────────────────────────

interface PastEventCardProps {
  evt: HealthEvent;
  isAdmin: boolean;
  onManage: () => void;
  onDelete: () => void;
  onCopyLink: () => void;
}

function PastEventCard({ evt, isAdmin, onManage, onDelete, onCopyLink }: PastEventCardProps) {
  const presentes = evt.presents_count ?? 0;
  const faltas    = (evt.participants_count ?? 0) - presentes;
  const coverUrl  = evt.cover_url;

  const dateStr = (() => {
    const d = evt.event_date;
    const iso = typeof d === 'string' && d.includes('T') ? d.split('T')[0] : String(d);
    const [y, m, day] = iso.split('-').map(Number);
    return new Date(y, m - 1, day).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' });
  })();

  return (
    <div
      id={`past-card-${evt.id}`}
      className="bg-white rounded-2xl sm:rounded-3xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-200 flex flex-col group border border-zinc-100"
    >
      {/* Faixa superior com gradiente escuro + overlay encerrado */}
      <div className="relative bg-gradient-to-br from-zinc-700 to-zinc-900 p-4 overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          {coverUrl && <img src={coverUrl} alt="" className="w-full h-full object-cover" />}
        </div>
        <div className="relative z-10 flex items-start justify-between gap-2">
          <div>
            <span className="inline-flex items-center gap-1 text-[9px] font-black text-white/60 bg-white/10 px-2 py-0.5 rounded-full mb-2">
              <Check size={8} />ENCERRADO
            </span>
            <h3 className="text-sm font-black text-white leading-snug line-clamp-2">{evt.title}</h3>
          </div>
          {isAdmin && (
            <div className="flex gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
              <IconButton size="xs" variant="ghost" title="Gestão" onClick={onManage} className="bg-white/20 border-0 text-white hover:bg-white/30">
                <BarChart2 size={11} />
              </IconButton>
              <IconButton size="xs" variant="ghost" title="Copiar link" onClick={onCopyLink} className="bg-white/20 border-0 text-white hover:bg-white/30">
                <Link2 size={11} />
              </IconButton>
              <IconButton size="xs" variant="ghost" title="Editar" onClick={onManage} className="bg-white/20 border-0 text-white hover:bg-white/30">
                <Pencil size={11} />
              </IconButton>
              <IconButton size="xs" variant="danger" title="Excluir" onClick={onDelete} className="bg-white/20 border-0">
                <Trash2 size={11} />
              </IconButton>
            </div>
          )}
        </div>
      </div>

      <div className="p-4 flex flex-col gap-3 flex-1">
        {/* Meta info */}
        <div className="flex flex-wrap gap-x-3 gap-y-1">
          <span className="flex items-center gap-1 text-[11px] text-slate-500">
            <Calendar size={11} />{dateStr}
          </span>
          <span className="text-[10px] font-bold text-brand-clay uppercase tracking-wide">{evt.category}</span>
        </div>

        {/* Stats de participação */}
        <div className="grid grid-cols-3 gap-2">
          <div className="bg-zinc-50 rounded-xl p-2 text-center">
            <p className="text-base font-black text-zinc-700">{evt.participants_count}</p>
            <p className="text-[9px] font-bold text-zinc-400 uppercase tracking-wider">Confirm.</p>
          </div>
          <div className="bg-emerald-50 rounded-xl p-2 text-center">
            <p className="text-base font-black text-emerald-600">{presentes}</p>
            <p className="text-[9px] font-bold text-emerald-400 uppercase tracking-wider">Presentes</p>
          </div>
          <div className="bg-red-50 rounded-xl p-2 text-center">
            <p className="text-base font-black text-red-500">{faltas}</p>
            <p className="text-[9px] font-bold text-red-300 uppercase tracking-wider">Faltas</p>
          </div>
        </div>

        {evt.description && (
          <p className="text-[11px] text-slate-400 leading-relaxed line-clamp-2">{evt.description}</p>
        )}

        {/* Rodapé */}
        <div className="flex items-center justify-end pt-3 border-t border-zinc-100 mt-auto gap-2 flex-wrap">
          {isAdmin && (
            <Button
              variant="ghost"
              size="sm"
              iconLeft={<BarChart2 size={13} />}
              onClick={onManage}
            >
              Ver gestão
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
