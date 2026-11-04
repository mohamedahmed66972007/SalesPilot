import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useEffect, type ReactNode } from 'react';
import '@/shared/i18n';
import { DATA_MODE } from '@/shared/constants/env';
import { DataAdapterProvider } from '@/data/DataAdapterContext';
import { AuthProvider } from '@/features/auth/AuthContext';
import { createDataAdapter } from '@/data/provider';
import { useAuth } from '@/features/auth/useAuth';
import { usePreferences } from '@/shared/stores/preferences';
import { changeLanguage } from '@/shared/i18n';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: 1, refetchOnWindowFocus: false },
  },
});

const dataAdapter = createDataAdapter(DATA_MODE);

function PreferencesSync() {
  const { state } = useAuth();
  const setUserId = usePreferences((preferences) => preferences.setUserId);
  const language = usePreferences((preferences) => preferences.language);
  const appearance = usePreferences((preferences) => preferences.appearance);
  const theme = usePreferences((preferences) => preferences.theme);

  useEffect(() => {
    if (state.status === 'ready') setUserId(state.member.id);
  }, [setUserId, state]);

  useEffect(() => {
    void changeLanguage(language);
  }, [language]);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    document.documentElement.dataset.appearance = appearance;
    document.documentElement.style.colorScheme = appearance;
  }, [appearance, theme]);

  return null;
}

export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <DataAdapterProvider adapter={dataAdapter}>
        <AuthProvider>
          <PreferencesSync />
          {children}
        </AuthProvider>
      </DataAdapterProvider>
    </QueryClientProvider>
  );
}
