import { useState } from 'react';
import { Chrome } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/shared/ui/Button';
import { firebaseErrorCode } from '@/shared/auth/firebase';
import { useAuth } from '@/features/auth/useAuth';

type GoogleFailure = 'accountExists' | 'unauthorizedDomain' | 'popupBlocked' | 'network' | 'unknown';

const DISMISSED_CODES = new Set(['auth/popup-closed-by-user', 'auth/cancelled-popup-request']);

function googleFailure(code: string | null): GoogleFailure {
  switch (code) {
    case 'auth/account-exists-with-different-credential':
      return 'accountExists';
    case 'auth/unauthorized-domain':
      return 'unauthorizedDomain';
    case 'auth/popup-blocked':
      return 'popupBlocked';
    case 'auth/network-request-failed':
      return 'network';
    default:
      return 'unknown';
  }
}

export function GoogleSignInButton() {
  const { t } = useTranslation();
  const { signInWithGoogle } = useAuth();
  const [busy, setBusy] = useState(false);
  const [failure, setFailure] = useState<GoogleFailure | null>(null);

  const onClick = async () => {
    setBusy(true);
    setFailure(null);
    try {
      await signInWithGoogle();
    } catch (error) {
      const code = firebaseErrorCode(error);
      if (!code || !DISMISSED_CODES.has(code)) setFailure(googleFailure(code));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-3 text-xs uppercase tracking-wide text-neutral-500">
        <span className="h-px flex-1 bg-neutral-200" aria-hidden="true" />
        <span>{t('auth.google.or')}</span>
        <span className="h-px flex-1 bg-neutral-200" aria-hidden="true" />
      </div>
      <Button variant="secondary" onClick={() => void onClick()} disabled={busy} className="w-full">
        <Chrome className="h-4 w-4" aria-hidden="true" />
        {busy ? t('auth.google.submitting') : t('auth.google.submit')}
      </Button>
      {failure && (
        <p role="alert" className="rounded-lg bg-error-50 px-3 py-2 text-sm text-error-700">
          {t(`auth.errors.${failure}`)}
        </p>
      )}
    </div>
  );
}
