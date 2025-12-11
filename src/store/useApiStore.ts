import { create } from 'zustand';

/**
 * API store manages global API state like loading states and errors.
 * Useful for showing global loading indicators or handling API errors.
 * 
 * @example
 * ```tsx
 * // Check if any API call is in progress
 * const isLoading = useApiStore(state => state.isLoading);
 * 
 * // Set global loading state
 * const setLoading = useApiStore(state => state.setLoading);
 * setLoading(true);
 * 
 * // Set global error
 * const setError = useApiStore(state => state.setError);
 * setError('Something went wrong');
 * ```
 */

interface ApiStore {
  isLoading: boolean;
  error: string | null;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearError: () => void;
}

const useApiStore = create<ApiStore>((set) => ({
  isLoading: false,
  error: null,
  setLoading: (loading) => set({ isLoading: loading }),
  setError: (error) => set({ error }),
  clearError: () => set({ error: null }),
}));

export default useApiStore;