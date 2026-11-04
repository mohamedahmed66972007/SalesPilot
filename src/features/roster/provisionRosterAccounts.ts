import { provisionFirebaseAccount, firebaseErrorCode } from '@/shared/auth/firebase';
import type { RosterFileRow } from '@/features/roster/rosterSheet';

export interface ProvisionReport {
  created: number;
  existing: number;
  failedLines: number[];
  firstErrorCode: string | null;
}

export async function provisionRosterAccounts(
  rows: RosterFileRow[],
  onProgress: (done: number) => void
): Promise<ProvisionReport> {
  const report: ProvisionReport = { created: 0, existing: 0, failedLines: [], firstErrorCode: null };
  for (const [index, { row, password }] of rows.entries()) {
    if (!password) {
      report.failedLines.push(row.line);
      if (report.firstErrorCode === null) report.firstErrorCode = 'missing_password';
    } else {
      try {
        const outcome = await provisionFirebaseAccount(row.email, password);
        if (outcome === 'created') report.created += 1;
        else report.existing += 1;
      } catch (error) {
        report.failedLines.push(row.line);
        const code = firebaseErrorCode(error);
        if (report.firstErrorCode === null && code) report.firstErrorCode = code;
      }
    }
    onProgress(index + 1);
  }
  return report;
}
