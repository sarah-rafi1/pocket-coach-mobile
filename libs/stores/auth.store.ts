import { create } from 'zustand';
import { User } from '../types';

/**
 * Authentication store manages the user's authentication state.
 * Provides functionality to set and remove the current user.
 * 
 * @example
 * ```tsx
 * // Access the current user
 * const user = useUserStore(state => state.user);
 * 
 * // Set user after login
 * const setUser = useUserStore(state => state.setUser);
 * setUser(userData);
 * 
 * // Remove user on logout
 * const removeUser = useUserStore(state => state.removeUser);
 * removeUser();
 * ```
 */

interface UserStore {
  user: User | null;
  setUser: (user: User) => void;
  removeUser: () => void;
}

const useUserStore = create<UserStore>((set) => ({
  user: null,
  setUser: (user) => set({ user }),
  removeUser: () => set({ user: null }),
}));

export default useUserStore;