import { useState } from 'react';
import { eventsApi } from '../lib/api';

interface UseEventInscriptionState {
  isLoading: boolean;
  error: string | null;
  isEnrolled: boolean;
}

export function useEventInscription(eventId: string, initialEnrolled: boolean = false) {
  const [state, setState] = useState<UseEventInscriptionState>({
    isLoading: false,
    error: null,
    isEnrolled: initialEnrolled,
  });

  const enroll = async () => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    try {
      const result = await eventsApi.enroll(eventId);
      setState(prev => ({
        ...prev,
        isEnrolled: result.enrolled,
        isLoading: false,
      }));
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao inscrever-se no evento';
      setState(prev => ({
        ...prev,
        error: errorMessage,
        isLoading: false,
      }));
      throw err;
    }
  };

  const unenroll = async () => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    try {
      // Se houver endpoint de unenroll, usar; caso contrário, apenas atualizar state
      // const result = await eventsApi.unenroll(eventId);
      setState(prev => ({
        ...prev,
        isEnrolled: false,
        isLoading: false,
      }));
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao desinscrever-se';
      setState(prev => ({
        ...prev,
        error: errorMessage,
        isLoading: false,
      }));
      throw err;
    }
  };

  return {
    ...state,
    enroll,
    unenroll,
  };
}
