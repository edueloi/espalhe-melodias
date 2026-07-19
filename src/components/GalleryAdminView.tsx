import React, { useState, useEffect, useRef } from 'react';
import { Image as ImageIcon, Plus, Pencil, Trash2, X, Loader2, Upload } from 'lucide-react';
import { AppUser } from '../types';
import { PageWrapper, SectionTitle, ContentCard, ConfirmModal, Modal, ModalFooter, useToast } from './ui';
import { galleryApi, uploadApi, resolveUploadUrl, type GalleryPhoto } from '../lib/api';

interface GalleryAdminViewProps {
  currentUser: AppUser;
}

export default function GalleryAdminView({ currentUser }: GalleryAdminViewProps) {
  const { show: showToast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [photos, setPhotos] = useState<GalleryPhoto[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  const [editingPhoto, setEditingPhoto] = useState<GalleryPhoto | null>(null);
  const [editCaption, setEditCaption] = useState('');
  const [savingEdit, setSavingEdit] = useState(false);

  const [deletingPhoto, setDeletingPhoto] = useState<GalleryPhoto | null>(null);
  const [deleting, setDeleting] = useState(false);

  const canManage = currentUser.role !== 'member';

  const loadPhotos = () => {
    setLoading(true);
    galleryApi.list({ limit: 100 })
      .then(res => setPhotos(res.data))
      .catch(err => showToast(err instanceof Error ? err.message : 'Erro ao carregar galeria.', 'error'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { loadPhotos(); }, []);

  const handleFileSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = '';

    setUploading(true);
    try {
      const { imageUrl } = await uploadApi.uploadGalleryPhoto(file);
      await galleryApi.create({ imageUrl });
      showToast('Foto adicionada à galeria!', 'success');
      loadPhotos();
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Erro ao enviar foto.', 'error');
    } finally {
      setUploading(false);
    }
  };

  const openEdit = (photo: GalleryPhoto) => {
    setEditingPhoto(photo);
    setEditCaption(photo.caption ?? '');
  };

  const handleSaveEdit = async () => {
    if (!editingPhoto) return;
    setSavingEdit(true);
    try {
      await galleryApi.update(editingPhoto.id, { caption: editCaption });
      showToast('Legenda atualizada!', 'success');
      setEditingPhoto(null);
      loadPhotos();
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Erro ao atualizar legenda.', 'error');
    } finally {
      setSavingEdit(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingPhoto) return;
    setDeleting(true);
    try {
      await galleryApi.delete(deletingPhoto.id);
      showToast('Foto excluída.', 'success');
      setDeletingPhoto(null);
      loadPhotos();
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Erro ao excluir foto.', 'error');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <PageWrapper>
      <SectionTitle
        title="Galeria do Site"
        description="Fotos exibidas na página pública, em Início e Galeria."
        icon={ImageIcon}
        action={canManage && (
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="flex items-center gap-2 px-4 py-2.5 bg-brand-clay hover:bg-brand-clay-dark disabled:opacity-60 text-white text-xs font-bold uppercase tracking-wider rounded-xl shadow-md shadow-brand-clay/20 transition shrink-0"
          >
            {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
            {uploading ? 'Enviando...' : 'Adicionar Foto'}
          </button>
        )}
        divider
      />

      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        className="hidden"
        onChange={handleFileSelected}
      />

      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="aspect-square rounded-2xl bg-slate-100 animate-pulse" />
          ))}
        </div>
      ) : photos.length === 0 ? (
        <ContentCard padding="lg">
          <div className="text-center py-10">
            <ImageIcon className="w-11 h-11 text-brand-clay/40 mx-auto mb-4" strokeWidth={1.5} />
            <p className="font-semibold text-brand-navy mb-2">Nenhuma foto na galeria ainda</p>
            <p className="text-sm text-slate-500 mb-5">
              As fotos que você enviar aqui aparecem automaticamente na Galeria do site público.
            </p>
            {canManage && (
              <button
                onClick={() => fileInputRef.current?.click()}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-brand-clay hover:bg-brand-clay-dark text-white text-sm font-bold rounded-xl transition"
              >
                <Upload className="w-4 h-4" />
                Enviar primeira foto
              </button>
            )}
          </div>
        </ContentCard>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {photos.map(photo => (
            <div key={photo.id} className="group relative rounded-2xl overflow-hidden border border-brand-sand shadow-sm bg-white">
              <div className="aspect-square bg-slate-100">
                <img
                  src={resolveUploadUrl(photo.image_url)}
                  alt={photo.caption || 'Foto da galeria'}
                  className="w-full h-full object-cover"
                />
              </div>
              {photo.caption && (
                <p className="px-3 py-2 text-xs text-slate-600 line-clamp-2">{photo.caption}</p>
              )}
              {canManage && (
                <div className="absolute top-2 right-2 flex gap-1.5 opacity-0 group-hover:opacity-100 transition">
                  <button
                    onClick={() => openEdit(photo)}
                    className="p-2 rounded-lg bg-white/90 backdrop-blur text-slate-600 hover:text-brand-clay shadow-sm transition"
                    aria-label="Editar legenda"
                  >
                    <Pencil className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => setDeletingPhoto(photo)}
                    className="p-2 rounded-lg bg-white/90 backdrop-blur text-slate-600 hover:text-red-600 shadow-sm transition"
                    aria-label="Excluir foto"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Modal de edição de legenda */}
      <Modal
        isOpen={!!editingPhoto}
        onClose={() => setEditingPhoto(null)}
        title="Editar legenda"
        size="sm"
        footer={
          <ModalFooter>
            <button
              onClick={() => setEditingPhoto(null)}
              className="px-4 py-2.5 border border-brand-sand hover:bg-brand-sand/40 rounded-xl text-xs font-bold text-brand-navy transition"
            >
              Cancelar
            </button>
            <button
              onClick={handleSaveEdit}
              disabled={savingEdit}
              className="px-5 py-2.5 bg-brand-clay hover:bg-brand-clay-dark disabled:opacity-60 text-white text-xs font-bold uppercase tracking-wider rounded-xl shadow-md transition"
            >
              {savingEdit ? 'Salvando...' : 'Salvar'}
            </button>
          </ModalFooter>
        }
      >
        {editingPhoto && (
          <div className="space-y-4">
            <img
              src={resolveUploadUrl(editingPhoto.image_url)}
              alt=""
              className="w-full h-40 object-cover rounded-xl"
            />
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Legenda</label>
              <textarea
                value={editCaption}
                onChange={e => setEditCaption(e.target.value)}
                rows={3}
                placeholder="Descreva o momento capturado nesta foto..."
                className="w-full text-sm text-brand-navy bg-brand-cream border border-brand-sand px-3 py-2.5 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-clay/30 transition resize-none"
              />
            </div>
          </div>
        )}
      </Modal>

      {/* Confirmação de exclusão */}
      <ConfirmModal
        isOpen={!!deletingPhoto}
        onClose={() => setDeletingPhoto(null)}
        onConfirm={handleDelete}
        title="Excluir foto"
        message="Esta foto será removida da galeria do site permanentemente."
        variant="danger"
        confirmLabel="Excluir"
        loading={deleting}
      />
    </PageWrapper>
  );
}
