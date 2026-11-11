import { addDays, TODAY } from '../../store';
import type { Package, Payment } from '../../data/types';

/** Payment schedule from a package plan: deposit due at the 30-day deadline, the rest N days before the event. */
export function buildPayments(pkg: Package, total: number, eventDate: string, deadline = addDays(TODAY, 30)): Payment[] {
  return pkg.plan.map(i => ({
    label: i.label,
    amount: Math.round((total * i.pct) / 100),
    due: i.daysBefore === null ? deadline : addDays(eventDate, -i.daysBefore),
  }));
}
