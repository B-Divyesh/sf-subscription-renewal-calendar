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
export const isValidDay = (day: string) => /^\d{4}-\d{2}-\d{2}$/.test(day) && !Number.isNaN(parseDay(day).getTime()) && dayString(parseDay(day)) === day;
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

/** Parse RFC 4180 records, including quoted commas, quotes, and line breaks. */
export function parseCsvRecords(text: string): string[][] {
  const source = text.replace(/^\uFEFF/, '');
  const records: string[][] = [];
  let record: string[] = [];
  let field = '';
  let quoted = false;
  let quoteClosed = false;

  const finishField = () => { record.push(field); field = ''; quoteClosed = false; };
  const finishRecord = () => { finishField(); records.push(record); record = []; };

  for (let index = 0; index < source.length; index += 1) {
    const char = source[index];
    if (quoted) {
      if (char === '"' && source[index + 1] === '"') { field += '"'; index += 1; }
      else if (char === '"') { quoted = false; quoteClosed = true; }
      else field += char;
      continue;
    }
    if (quoteClosed && char !== ',' && char !== '\r' && char !== '\n') throw new Error('The CSV has text after a closing quote.');
    if (char === '"') {
      if (field.length) throw new Error('The CSV has a quote inside an unquoted field.');
      quoted = true;
    } else if (char === ',') finishField();
    else if (char === '\r' || char === '\n') {
      if (char === '\r' && source[index + 1] === '\n') index += 1;
      finishRecord();
    } else field += char;
  }
  if (quoted) throw new Error('The CSV has an unclosed quoted field.');
  if (field || record.length || quoteClosed) finishRecord();
  while (records.length && records.at(-1)!.every((cell) => cell === '')) records.pop();
  return records;
}

const csvCell = (value: string | number) => `"${String(value).replaceAll('"', '""')}"`;

export function subscriptionsCsv(items: Subscription[]): string {
  const rows = items.map((item) => [item.name, item.amount, item.currency, item.frequency, item.startsOn, item.owner, item.reviewDays, item.decision, item.note || '']);
  return ['name,amount,currency,frequency,starts_on,owner,review_days,decision,note', ...rows.map((row) => row.map(csvCell).join(','))].join('\r\n');
}

export function parseSubscriptionsCsv(text: string, makeId: () => string = () => crypto.randomUUID()): Subscription[] {
  const records = parseCsvRecords(text);
  if (records.length < 2) throw new Error('The CSV needs a heading row and at least one subscription.');
  const headers = records.shift()!.map((cell) => cell.trim().toLowerCase());
  const required = ['name', 'amount', 'frequency', 'starts_on', 'owner'];
  if (required.some((header) => !headers.includes(header))) throw new Error('Use headings: name, amount, frequency, starts_on, owner.');

  return records.map((cells, index) => {
    const row = index + 2;
    const get = (key: string) => (cells[headers.indexOf(key)] || '').trim();
    const name = get('name');
    const owner = get('owner');
    const amountText = get('amount');
    const amount = Number(amountText);
    const frequency = get('frequency').toLowerCase();
    const startsOn = get('starts_on');
    const reviewText = get('review_days') || '7';
    const reviewDays = Number(reviewText);
    const decisionText = get('decision').toLowerCase();
    const decision = decisionText || 'review';
    if (!name || !owner) throw new Error(`Row ${row} needs both a name and an owner.`);
    if (!amountText || !Number.isFinite(amount) || amount < 0) throw new Error(`Row ${row} has an invalid amount. Use zero or a positive number.`);
    if (!['weekly', 'monthly', 'annual'].includes(frequency)) throw new Error(`Row ${row} has an invalid frequency. Use weekly, monthly, or annual.`);
    if (!isValidDay(startsOn)) throw new Error(`Row ${row} has an invalid starts_on date. Use a real YYYY-MM-DD date.`);
    if (!Number.isInteger(reviewDays) || reviewDays < 0) throw new Error(`Row ${row} has invalid review_days. Use zero or a positive whole number.`);
    if (!['review', 'keep', 'cancel'].includes(decision)) throw new Error(`Row ${row} has an invalid decision. Use review, keep, or cancel.`);
    return {
      id: makeId(), name, amount, currency: get('currency') || 'USD',
      frequency: frequency as Frequency, startsOn, owner, reviewDays,
      decision: decision as Decision, note: get('note')
    };
  });
}

export const sampleSubscriptions = (): Subscription[] => [
  { id: 'sample-linear', name: 'Linear', amount: 96, currency: 'USD', frequency: 'monthly', startsOn: '2026-08-03', owner: 'Maya', reviewDays: 10, decision: 'keep', note: 'Product planning seats' },
  { id: 'sample-openai', name: 'OpenAI API', amount: 185, currency: 'USD', frequency: 'monthly', startsOn: '2026-09-02', owner: 'Jules', reviewDays: 7, decision: 'review', note: 'Check usage before renewal' },
  { id: 'sample-aws', name: 'AWS', amount: 410, currency: 'USD', frequency: 'monthly', startsOn: '2026-09-08', owner: 'Nia', reviewDays: 14, decision: 'review', note: 'Cost rose last month' },
  { id: 'sample-posthog', name: 'PostHog', amount: 74, currency: 'USD', frequency: 'monthly', startsOn: '2026-09-14', owner: 'Nia', reviewDays: 7, decision: 'cancel', note: 'Decide after campaign' },
  { id: 'sample-cleaner', name: 'Office cleaner', amount: 85, currency: 'USD', frequency: 'weekly', startsOn: '2026-08-28', owner: 'Maya', reviewDays: 3, decision: 'keep', note: 'Friday visit' },
  { id: 'sample-insurance', name: 'Business insurance', amount: 1240, currency: 'USD', frequency: 'annual', startsOn: '2026-10-11', owner: 'Jules', reviewDays: 21, decision: 'review', note: 'Request alternatives' }
];
