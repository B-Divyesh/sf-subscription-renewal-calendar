export type Frequency = 'weekly' | 'monthly' | 'annual';
export type Decision = 'review' | 'keep' | 'cancel';

export interface Subscription {
  id: string;
  name: string;
  amount: number;
  currency: string;
  frequency: Frequency;
  startsOn: string;
  owner: string;
  reviewDays: number;
  decision: Decision;
  note?: string;
}

export interface Occurrence extends Subscription { dueOn: string; reviewOn: string; }

const dayMs = 86_400_000;
export const parseDay = (day: string) => new Date(`${day}T12:00:00Z`);
export const dayString = (date: Date) => date.toISOString().slice(0, 10);
export const addDays = (day: string, days: number) => dayString(new Date(parseDay(day).getTime() + days * dayMs));
export const money = (value: number, currency = 'USD') => new Intl.NumberFormat(undefined, { style: 'currency', currency, maximumFractionDigits: 2 }).format(value);

function monthDate(start: Date, offset: number): Date {
  const targetYear = start.getUTCFullYear() + Math.floor((start.getUTCMonth() + offset) / 12);
  const targetMonth = (start.getUTCMonth() + offset) % 12;
  const last = new Date(Date.UTC(targetYear, targetMonth + 1, 0)).getUTCDate();
  return new Date(Date.UTC(targetYear, targetMonth, Math.min(start.getUTCDate(), last), 12));
}

export function occurrencesFor(subscription: Subscription, from: string, to: string): Occurrence[] {
  const start = parseDay(subscription.startsOn);
  const fromDate = parseDay(from); const toDate = parseDay(to);
  const dates: Date[] = [];
  if (subscription.frequency === 'weekly') {
    let current = start;
    while (current < fromDate) current = new Date(current.getTime() + 7 * dayMs);
    while (current <= toDate) { dates.push(current); current = new Date(current.getTime() + 7 * dayMs); }
  } else if (subscription.frequency === 'monthly') {
    let step = Math.max(0, (fromDate.getUTCFullYear() - start.getUTCFullYear()) * 12 + fromDate.getUTCMonth() - start.getUTCMonth() - 1);
    let current = monthDate(start, step);
    while (current < fromDate) current = monthDate(start, ++step);
    while (current <= toDate) { dates.push(current); current = monthDate(start, ++step); }
  } else {
    let year = Math.max(0, fromDate.getUTCFullYear() - start.getUTCFullYear() - 1);
    let current = monthDate(start, year * 12);
    while (current < fromDate) current = monthDate(start, ++year * 12);
    while (current <= toDate) { dates.push(current); current = monthDate(start, ++year * 12); }
  }
  return dates.map((date) => ({ ...subscription, dueOn: dayString(date), reviewOn: addDays(dayString(date), -subscription.reviewDays) }));
}

export function allOccurrences(items: Subscription[], from: string, to: string): Occurrence[] {
  return items.flatMap((item) => occurrencesFor(item, from, to)).sort((a, b) => a.dueOn.localeCompare(b.dueOn));
}

export function icsReminders(items: Subscription[], from: string, to: string): string {
  const stamp = from.replaceAll('-', '');
  const body = allOccurrences(items, from, to).map((x, index) => `BEGIN:VEVENT\r\nUID:renewal-${x.id}-${index}@renewal-ledger.local\r\nDTSTAMP:${stamp}T120000Z\r\nDTSTART;VALUE=DATE:${x.reviewOn.replaceAll('-', '')}\r\nSUMMARY:Review ${x.name} before ${money(x.amount, x.currency)} renewal\r\nDESCRIPTION:Owner: ${x.owner || 'Unassigned'}. Renewal date: ${x.dueOn}. Decision: ${x.decision}.\r\nEND:VEVENT`).join('\r\n');
  return `BEGIN:VCALENDAR\r\nVERSION:2.0\r\nPRODID:-//Renewal Ledger//EN\r\n${body}\r\nEND:VCALENDAR`;
}

export const sampleSubscriptions = (): Subscription[] => [
  { id: 'sample-linear', name: 'Linear', amount: 96, currency: 'USD', frequency: 'monthly', startsOn: '2026-08-03', owner: 'Maya', reviewDays: 10, decision: 'keep', note: 'Product planning seats' },
  { id: 'sample-openai', name: 'OpenAI API', amount: 185, currency: 'USD', frequency: 'monthly', startsOn: '2026-09-02', owner: 'Jules', reviewDays: 7, decision: 'review', note: 'Check usage before renewal' },
  { id: 'sample-aws', name: 'AWS', amount: 410, currency: 'USD', frequency: 'monthly', startsOn: '2026-09-08', owner: 'Nia', reviewDays: 14, decision: 'review', note: 'Cost rose last month' },
  { id: 'sample-posthog', name: 'PostHog', amount: 74, currency: 'USD', frequency: 'monthly', startsOn: '2026-09-14', owner: 'Nia', reviewDays: 7, decision: 'cancel', note: 'Decide after campaign' },
  { id: 'sample-cleaner', name: 'Office cleaner', amount: 85, currency: 'USD', frequency: 'weekly', startsOn: '2026-08-28', owner: 'Maya', reviewDays: 3, decision: 'keep', note: 'Friday visit' },
  { id: 'sample-insurance', name: 'Business insurance', amount: 1240, currency: 'USD', frequency: 'annual', startsOn: '2026-10-11', owner: 'Jules', reviewDays: 21, decision: 'review', note: 'Request alternatives' }
];
