import { create } from "zustand";
import { LIGHT_THEME,DARK_THEME } from "../constants/Theme";

/**
 * Theme store manages the application's theme state.
 * Provides functionality to toggle between light and dark themes.
 * 
 * @example
 * ```tsx
 * // Access the current theme
 * const theme = useThemeStore(state => state.theme);
 * 
 * // Toggle between light and dark theme
 * const toggleTheme = useThemeStore(state => state.toggleTheme);
 * 
 * // Set a specific theme
 * const setTheme = useThemeStore(state => state.setTheme);
 * setTheme(true); // Set to dark theme
 * ```
 */

interface ThemeStore {
  themeTag: string;
  theme: typeof LIGHT_THEME | typeof DARK_THEME;
  toggleTheme: () => void;
  setTheme: (isDark: boolean) => void;
}

const useThemeStore = create<ThemeStore>((set, get) => ({
  themeTag: 'light',
  theme: LIGHT_THEME,
  toggleTheme: () => {
    const newTheme = get().theme === LIGHT_THEME ? DARK_THEME : LIGHT_THEME;
    const newThemeTag = get().themeTag === 'light' ? 'dark' : 'light';
    set({ theme: newTheme, themeTag: newThemeTag });
  },

  setTheme: (isDark) => {
    set({ theme: isDark ? DARK_THEME : LIGHT_THEME, themeTag: isDark ? 'dark' : 'light' });
  },
}));

export default useThemeStore;