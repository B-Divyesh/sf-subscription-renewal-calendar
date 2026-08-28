import { describe, expect, it } from 'vitest';
import { allOccurrences, icsReminders, occurrencesFor, type Subscription } from '../src/domain';

const weekly: Subscription = { id: 'cleaning', name: 'Office cleaner', amount: 85, currency: 'USD', frequency: 'weekly', startsOn: '2026-08-28', owner: 'Maya', reviewDays: 3, decision: 'keep' };

describe('recurring charge dates', () => {
  it('@claim:weekly-occurrences shows every weekly occurrence in a month', () => {
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
  it('@claim:ics-export writes a calendar reminder for each renewal occurrence', () => {
    const calendar = icsReminders([weekly], '2026-09-01', '2026-09-30');
    expect(calendar.match(/BEGIN:VEVENT/g)).toHaveLength(4);
    expect(calendar).toContain('DTSTART;VALUE=DATE:20260901');
  });
  it('@claim:sixty-day-window includes a full 60-day renewal window', () => {
    const rows = allOccurrences([weekly], '2026-09-01', '2026-10-31');
    expect(rows).toHaveLength(9);
  });
});
