import { useState } from 'react';
import { newsletterApi } from '../lib/api';

interface UseNewsletterSubscriptionState {
  isLoading: boolean;
  error: string | null;
  isSubscribed: boolean;
}

export function useNewsletterSubscription() {
  const [state, setState] = useState<UseNewsletterSubscriptionState>({
    isLoading: false,
    error: null,
    isSubscribed: false,
  });

  const subscribe = async (email: string) => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    try {
      const result = await newsletterApi.subscribe(email);
      setState(prev => ({
        ...prev,
        isSubscribed: true,
        isLoading: false,
      }));
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao inscrever-se na newsletter';
      setState(prev => ({
        ...prev,
        error: errorMessage,
        isLoading: false,
      }));
      throw err;
    }
  };

  const unsubscribe = async (email: string) => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    try {
      await newsletterApi.unsubscribe(email);
      setState(prev => ({
        ...prev,
        isSubscribed: false,
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

  const resetState = () => {
    setState({
      isLoading: false,
      error: null,
      isSubscribed: false,
    });
  };

  return {
    ...state,
    subscribe,
    unsubscribe,
    resetState,
  };
}
