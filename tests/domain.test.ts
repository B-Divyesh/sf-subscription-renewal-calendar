import { describe, expect, it } from 'vitest';
import { allOccurrences, icsReminders, occurrencesFor, parseSubscriptionsCsv, subscriptionsCsv, type Subscription } from '../src/domain';

const weekly: Subscription = { id: 'cleaning', name: 'Office cleaner', amount: 85, currency: 'USD', frequency: 'weekly', startsOn: '2026-08-28', owner: 'Maya', reviewDays: 3, decision: 'keep' };

describe('recurring charge dates', () => {
  it('shows every weekly occurrence in a month', () => {
    expect(occurrencesFor(weekly, '2026-09-01', '2026-09-30').map((x) => x.dueOn)).toEqual(['2026-09-04', '2026-09-11', '2026-09-18', '2026-09-25']);
  });
  it('clamps a monthly renewal from the 31st to the last day of shorter months', () => {
    const item = { ...weekly, frequency: 'monthly' as const, startsOn: '2026-01-31' };
    expect(occurrencesFor(item, '2026-02-01', '2026-04-30').map((x) => x.dueOn)).toEqual(['2026-02-28', '2026-03-31', '2026-04-30']);
  });
  it('uses date-only UTC calculations across daylight-saving boundaries', () => {
    const rows = allOccurrences([weekly], '2026-10-01', '2026-11-10');
    expect(rows.map((x) => x.dueOn)).toEqual(['2026-10-02', '2026-10-09', '2026-10-16', '2026-10-23', '2026-10-30', '2026-11-06']);
    expect(rows[0].reviewOn).toBe('2026-09-29');
  });
  it('writes a calendar reminder for each renewal occurrence', () => {
    const calendar = icsReminders([weekly], '2026-09-01', '2026-09-30');
    expect(calendar.match(/BEGIN:VEVENT/g)).toHaveLength(4);
    expect(calendar).toContain('DTSTART;VALUE=DATE:20260901');
  });

  it('escapes RFC 5545 text in calendar summaries and descriptions', () => {
    const item = { ...weekly, name: 'Vendor, Inc; Plan\\Tier', owner: 'Rae\nOps' };
    const calendar = icsReminders([item], '2026-09-01', '2026-09-30');
    expect(calendar).toContain('SUMMARY:Review Vendor\\, Inc\\; Plan\\\\Tier');
    expect(calendar).toContain('DESCRIPTION:Owner: Rae\\nOps.');
  });
  it('includes a full 60-day renewal window', () => {
    const rows = allOccurrences([weekly], '2026-09-01', '2026-10-31');
    expect(rows).toHaveLength(9);
  });
});

describe('CSV validation', () => {
  it('round-trips quoted commas, quotes, and line breaks', () => {
    const source = { ...weekly, name: 'Hosting, "Priority"', note: 'First line\nSecond line' };
    expect(parseSubscriptionsCsv(subscriptionsCsv([source]), () => source.id)).toEqual([source]);
  });

  it('rejects impossible calendar dates before persistence', () => {
    const csv = 'name,amount,frequency,starts_on,owner\nTool,10,monthly,2026-02-30,Rae';
    expect(() => parseSubscriptionsCsv(csv)).toThrow('Row 2 has an invalid starts_on date');
  });

  it.each(['-1', '1.5', 'soon'])('rejects invalid review_days value %s', (reviewDays) => {
    const csv = `name,amount,frequency,starts_on,owner,review_days\nTool,10,monthly,2026-02-28,Rae,${reviewDays}`;
    expect(() => parseSubscriptionsCsv(csv)).toThrow('Row 2 has invalid review_days');
  });

  it('rejects an unknown decision instead of silently changing it', () => {
    const csv = 'name,amount,frequency,starts_on,owner,decision\nTool,10,monthly,2026-02-28,Rae,maybe';
    expect(() => parseSubscriptionsCsv(csv)).toThrow('Row 2 has an invalid decision');
  });

  it('rejects a currency that the calendar cannot safely format', () => {
    const csv = 'name,amount,currency,frequency,starts_on,owner\nBad currency,10,NOT-A-CURRENCY,monthly,2026-08-28,Rae';
    expect(() => parseSubscriptionsCsv(csv)).toThrow('Row 2 has an invalid currency');
  });
});
