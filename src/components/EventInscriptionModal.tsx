import React, { useState } from 'react';
import { Calendar, Clock, MapPin, Users, X, Loader2, AlertCircle } from 'lucide-react';
import { Modal, Button } from './ui';
import { useEventInscription } from '../hooks/useEventInscription';
import type { HealthEvent } from '../types';

interface EventInscriptionModalProps {
  event: HealthEvent;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function EventInscriptionModal({
  event,
  isOpen,
  onClose,
  onSuccess,
}: EventInscriptionModalProps) {
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const { isLoading, error, isEnrolled, enroll } = useEventInscription(
    event.id,
    event.isEnrolled || false
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!agreedToTerms) return;

    try {
      await enroll();
      onSuccess?.();
      setTimeout(onClose, 2000);
    } catch (err) {
      console.error('Erro ao inscrever:', err);
    }
  };

  const eventDate = new Date(event.date);
  const formattedDate = eventDate.toLocaleDateString('pt-BR', {
    weekday: 'long',
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full">
        {/* Header */}
        <div className="bg-gradient-to-r from-brand-clay to-brand-clay-dark p-6 flex items-start justify-between">
          <div className="flex-1">
            <p className="text-white/80 text-xs font-semibold uppercase tracking-wider mb-1">
              {event.category}
            </p>
            <h2 className="text-white font-serif text-xl font-bold leading-snug">
              {event.title}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-white/60 hover:text-white transition p-1"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          {/* Event details */}
          <div className="space-y-3 bg-brand-sand/30 p-4 rounded-xl">
            <div className="flex items-center space-x-3 text-sm text-slate-700">
              <Calendar className="w-4 h-4 text-brand-clay flex-shrink-0" />
              <span>{formattedDate}</span>
            </div>
            <div className="flex items-center space-x-3 text-sm text-slate-700">
              <Clock className="w-4 h-4 text-brand-clay flex-shrink-0" />
              <span>{event.time}</span>
            </div>
            <div className="flex items-center space-x-3 text-sm text-slate-700">
              <Users className="w-4 h-4 text-brand-clay flex-shrink-0" />
              <span>{event.participantsCount} inscritos</span>
            </div>
            <div className="flex items-start space-x-3 text-sm text-slate-700">
              <MapPin className="w-4 h-4 text-brand-clay flex-shrink-0 mt-0.5" />
              <span>Tatuí, SP</span>
            </div>
          </div>

          {/* Description */}
          <div>
            <p className="text-xs font-semibold text-slate-600 uppercase mb-2">
              Descrição
            </p>
            <p className="text-sm text-slate-600 leading-relaxed line-clamp-3">
              {event.description}
            </p>
          </div>

          {/* Instructor info */}
          {event.instructorName && (
            <div className="flex items-center space-x-3 bg-brand-navy/5 p-3 rounded-lg">
              <img
                src={event.instructorAvatar}
                alt={event.instructorName}
                className="w-10 h-10 rounded-full object-cover border-2 border-brand-sand"
              />
              <div>
                <p className="text-xs font-semibold text-slate-600">Com:</p>
                <p className="text-sm font-semibold text-brand-navy">
                  {event.instructorName}
                </p>
              </div>
            </div>
          )}

          {/* Error message */}
          {error && (
            <div className="flex items-start gap-3 p-3 bg-red-50 border border-red-200 rounded-lg">
              <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          {/* Success message */}
          {isEnrolled && !error && (
            <div className="flex items-center gap-2 p-3 bg-emerald-50 border border-emerald-200 rounded-lg">
              <div className="w-2 h-2 bg-emerald-500 rounded-full" />
              <p className="text-sm text-emerald-700 font-semibold">
                Inscrição confirmada!
              </p>
            </div>
          )}

          {/* Terms agreement */}
          {!isEnrolled && (
            <div className="flex items-start space-x-2 pt-2">
              <input
                type="checkbox"
                id="terms"
                checked={agreedToTerms}
                onChange={e => setAgreedToTerms(e.target.checked)}
                className="w-4 h-4 rounded border-slate-300 text-brand-clay cursor-pointer mt-0.5"
              />
              <label htmlFor="terms" className="text-xs text-slate-600 cursor-pointer">
                Concordo com os{' '}
                <a
                  href="#"
                  className="text-brand-clay font-semibold hover:underline"
                  onClick={e => e.preventDefault()}
                >
                  termos e condições
                </a>{' '}
                do evento.
              </label>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-slate-50 px-6 py-4 rounded-b-2xl flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2.5 rounded-lg border border-slate-300 text-slate-700 font-semibold text-sm hover:bg-slate-100 transition"
          >
            Cancelar
          </button>
          <button
            onClick={handleSubmit}
            disabled={isLoading || isEnrolled || !agreedToTerms}
            className="flex-1 px-4 py-2.5 bg-gradient-to-r from-brand-clay to-brand-clay-dark text-white font-semibold text-sm rounded-lg hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Inscrevendo...
              </>
            ) : isEnrolled ? (
              'Já inscrito'
            ) : (
              'Confirmar Inscrição'
            )}
          </button>
        </div>
      </div>
    </Modal>
  );
}
