import { provisionFirebaseAccount } from '@/shared/auth/firebase';
import type { RosterFileRow } from '@/features/roster/rosterSheet';

export interface ProvisionReport {
  created: number;
  existing: number;
  failedLines: number[];
}

export async function provisionRosterAccounts(
  rows: RosterFileRow[],
  onProgress: (done: number) => void
): Promise<ProvisionReport> {
  const report: ProvisionReport = { created: 0, existing: 0, failedLines: [] };
  for (const [index, { row, password }] of rows.entries()) {
    if (!password) {
      report.failedLines.push(row.line);
    } else {
      try {
        const outcome = await provisionFirebaseAccount(row.email, password);
        if (outcome === 'created') report.created += 1;
        else report.existing += 1;
      } catch {
        report.failedLines.push(row.line);
      }
    }
    onProgress(index + 1);
  }
  return report;
}
