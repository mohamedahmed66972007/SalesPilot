import { useMemo, useState } from 'react';
import { LogOut, Search, Target, Upload, Users } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/features/auth/useAuth';
import { Badge } from '@/shared/ui/Badge';
import { Button } from '@/shared/ui/Button';
import { EmptyState } from '@/shared/ui/EmptyState';
import { ErrorState } from '@/shared/ui/ErrorState';
import { PageHeader } from '@/shared/ui/PageHeader';
import { Skeleton } from '@/shared/ui/Skeleton';
import { inputClass } from '@/shared/ui/Field';
import type { RosterMember, RosterMemberFields } from '@/features/roster/rosterApi';
import { useRemoveRosterMember, useRosterList, useUpdateRosterMember } from '@/features/roster/useRoster';
import { RosterTable } from '@/features/roster/RosterTable';
import { EditMemberDialog } from '@/features/roster/EditMemberDialog';
import { RemoveMemberDialog } from '@/features/roster/RemoveMemberDialog';
import { ImportRosterDialog } from '@/features/roster/ImportRosterDialog';

export function RosterPage({ member }: { member: RosterMember }) {
  const { t } = useTranslation();
  const { signOut } = useAuth();
  const rosterQuery = useRosterList(member.id);
  const updateMutation = useUpdateRosterMember();
  const removeMutation = useRemoveRosterMember();
  const [search, setSearch] = useState('');
  const [editing, setEditing] = useState<RosterMember | null>(null);
  const [removing, setRemoving] = useState<RosterMember | null>(null);
  const [importOpen, setImportOpen] = useState(false);
  const canImport = member.role !== 'EMPLOYEE';

  const roster = rosterQuery.data;
  const visibleMembers = useMemo(() => {
    const members = roster?.members ?? [];
    const term = search.trim().toLowerCase();
    if (!term) return members;
    return members.filter((person) =>
      [person.fullNameEn, person.fullNameAr, person.email, person.username].some((field) =>
        (field ?? '').toLowerCase().includes(term)
      )
    );
  }, [roster, search]);

  const closeEdit = () => {
    setEditing(null);
    updateMutation.reset();
  };

  const closeRemove = () => {
    setRemoving(null);
    removeMutation.reset();
  };

  const saveEdit = (fields: RosterMemberFields) => {
    if (!editing) return;
    updateMutation.mutate({ id: editing.id, fields }, { onSuccess: closeEdit });
  };

  const confirmRemove = () => {
    if (!removing) return;
    removeMutation.mutate(removing.id, { onSuccess: closeRemove });
  };

  return (
    <div className="min-h-dvh bg-neutral-50">
      <header className="border-b border-neutral-200 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
          <div className="flex items-center gap-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary-900 text-white">
              <Target className="h-5 w-5" aria-hidden="true" />
            </span>
            <span className="font-semibold text-primary-900">{t('app.name')}</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden min-w-0 flex-col items-end sm:flex">
              <span className="max-w-48 truncate text-sm font-medium text-primary-900" dir="auto">
                {member.fullNameEn}
              </span>
              <Badge tone={canImport ? 'info' : 'neutral'}>{t(`roles.${member.role}`)}</Badge>
            </div>
            <Button variant="ghost" size="sm" onClick={() => void signOut()} aria-label={t('auth.signOut')}>
              <LogOut className="h-4 w-4" aria-hidden="true" />
              <span className="hidden sm:inline">{t('auth.signOut')}</span>
            </Button>
          </div>
        </div>
      </header>

      <main className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-8 sm:px-6">
        <PageHeader
          title={t('roster.title')}
          description={t('roster.description')}
          actions={
            canImport && (
              <Button onClick={() => setImportOpen(true)}>
                <Upload className="h-4 w-4" aria-hidden="true" />
                {t('roster.import.open')}
              </Button>
            )
          }
        />

        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="relative w-full sm:max-w-sm">
              <Search className="pointer-events-none absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-500" aria-hidden="true" />
              <input
                type="search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder={t('roster.searchPlaceholder')}
                aria-label={t('roster.searchPlaceholder')}
                className={`${inputClass} ps-9`}
              />
            </div>
            {roster && <p className="text-sm text-neutral-600">{t('roster.total', { count: roster.members.length })}</p>}
          </div>

          {rosterQuery.isPending && <RosterSkeleton />}
          {rosterQuery.isError && (
            <div className="rounded-2xl border border-neutral-200 bg-white shadow-sm">
              <ErrorState onRetry={() => void rosterQuery.refetch()} />
            </div>
          )}
          {roster && roster.members.length === 0 && (
            <div className="rounded-2xl border border-neutral-200 bg-white shadow-sm">
              <EmptyState
                icon={<Users className="h-7 w-7" aria-hidden="true" />}
                title={t('roster.emptyTitle')}
                body={t('roster.emptyBody')}
              />
            </div>
          )}
          {roster && roster.members.length > 0 && visibleMembers.length === 0 && (
            <p className="rounded-2xl border border-neutral-200 bg-white px-6 py-10 text-center text-sm text-neutral-600 shadow-sm">
              {t('roster.noMatches')}
            </p>
          )}
          {visibleMembers.length > 0 && (
            <RosterTable members={visibleMembers} onEdit={setEditing} onRemove={setRemoving} />
          )}
        </div>
      </main>

      {roster && (
        <EditMemberDialog
          member={editing}
          roster={roster}
          pending={updateMutation.isPending}
          error={updateMutation.isError}
          onSave={saveEdit}
          onOpenChange={(open) => {
            if (!open) closeEdit();
          }}
        />
      )}
      <RemoveMemberDialog
        member={removing}
        pending={removeMutation.isPending}
        error={removeMutation.isError}
        onConfirm={confirmRemove}
        onOpenChange={(open) => {
          if (!open) closeRemove();
        }}
      />
      {canImport && <ImportRosterDialog open={importOpen} onOpenChange={setImportOpen} />}
    </div>
  );
}

function RosterSkeleton() {
  const { t } = useTranslation();
  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm" role="status">
      <span className="sr-only">{t('common.loading')}</span>
      {Array.from({ length: 5 }, (_, index) => (
        <Skeleton key={index} className="h-12 w-full" />
      ))}
    </div>
  );
}
