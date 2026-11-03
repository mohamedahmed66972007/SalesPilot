import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { ReactNode } from 'react';
import '@/shared/i18n';
import { DATA_MODE } from '@/shared/constants/env';
import { DataAdapterProvider } from '@/data/DataAdapterContext';
import { AuthProvider } from '@/features/auth/AuthContext';
import { createDataAdapter } from '@/data/provider';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: 1, refetchOnWindowFocus: false },
  },
});

const dataAdapter = createDataAdapter(DATA_MODE);

export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <DataAdapterProvider adapter={dataAdapter}>
        <AuthProvider>{children}</AuthProvider>
      </DataAdapterProvider>
    </QueryClientProvider>
  );
}
