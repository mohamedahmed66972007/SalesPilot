import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type AppLanguage = 'en' | 'ar';
export type DigitStyle = 'latin' | 'arabic-indic';

interface PreferencesState {
  language: AppLanguage;
  digits: DigitStyle;
  sidebarCollapsed: boolean;
  setLanguage: (language: AppLanguage) => void;
  setDigits: (digits: DigitStyle) => void;
  toggleSidebar: () => void;
}

export const usePreferences = create<PreferencesState>()(
  persist(
    (set) => ({
      language: 'en',
      digits: 'latin',
      sidebarCollapsed: false,
      setLanguage: (language) => set({ language }),
      setDigits: (digits) => set({ digits }),
      toggleSidebar: () => set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
    }),
    { name: 'salespilot-preferences' }
  )
);
