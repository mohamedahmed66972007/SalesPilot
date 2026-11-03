import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useDataAdapter } from '@/data/useDataAdapter';
import type { SaleFilters } from '@/data/adapters/repositories';
import type { SessionUser } from '@/shared/types/domain';

export const queryKeys = {
  currentUser: ['session', 'current-user'] as const,
};

export function useCurrentUser() {
  const adapter = useDataAdapter();
  return useQuery({
    queryKey: queryKeys.currentUser,
    queryFn: () => adapter.auth.currentUser(),
    staleTime: Infinity,
  });
}

/** Runs a tenant-scoped query once the acting user is known. Keys include the user so scopes never share cache. */
function useActorQuery<T>(
  scope: string,
  fetcher: (actor: SessionUser) => Promise<T>,
  extraKey: readonly unknown[] = []
) {
  const { data: actor } = useCurrentUser();
  return useQuery({
    queryKey: ['tenant', scope, actor?.id ?? null, ...extraKey],
    queryFn: () => {
      if (!actor) throw new Error('No active user');
      return fetcher(actor);
    },
    enabled: Boolean(actor?.companyId),
  });
}

export function useCompany() {
  const adapter = useDataAdapter();
  return useActorQuery('company', (actor) => adapter.organization.getCompany(actor));
}

export function useBranches() {
  const adapter = useDataAdapter();
  return useActorQuery('branches', (actor) => adapter.organization.listBranches(actor));
}

export function useTeams() {
  const adapter = useDataAdapter();
  return useActorQuery('teams', (actor) => adapter.organization.listTeams(actor));
}

export function useEmployees() {
  const adapter = useDataAdapter();
  return useActorQuery('employees', (actor) => adapter.organization.listEmployees(actor));
}

export function useSales(filters: SaleFilters = {}) {
  const adapter = useDataAdapter();
  return useActorQuery('sales', (actor) => adapter.sales.listSales(actor, filters), [filters]);
}

export function useProducts() {
  const adapter = useDataAdapter();
  return useActorQuery('products', (actor) => adapter.catalog.listProducts(actor));
}

export function usePlatformCompanies() {
  const adapter = useDataAdapter();
  const { data: actor } = useCurrentUser();
  return useQuery({
    queryKey: ['platform-companies', actor?.id ?? null],
    queryFn: () => {
      if (!actor) throw new Error('No active user');
      return adapter.platform.listCompanies(actor);
    },
    enabled: Boolean(actor) && actor?.companyId === null,
  });
}

export function useDemoPersonas() {
  const adapter = useDataAdapter();
  return useQuery({
    queryKey: ['session', 'demo-personas'],
    queryFn: () => adapter.auth.listDemoPersonas(),
  });
}

export function useSwitchDemoPersona() {
  const adapter = useDataAdapter();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (personaId: string) => adapter.auth.switchDemoPersona(personaId),
    onSuccess: () => queryClient.resetQueries(),
  });
}
