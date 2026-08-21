import { addDays, format } from 'date-fns';
import { getDeadlineStatus, getTaskOverdueStatus } from './dateUtils';

const iso = (offsetDays: number) => format(addDays(new Date(), offsetDays), 'yyyy-MM-dd');

describe('getDeadlineStatus', () => {
  it('does not flag a task as approaching just because its deadline matches the project deadline, when that deadline is still far away', () => {
    // Task started long ago, due the same day as the project, but today is
    // 41 days out from both — nothing is actually imminent yet.
    const status = getDeadlineStatus(iso(41), iso(41));
    expect(status.isApproaching).toBe(false);
  });

  it('flags a task as approaching once its own deadline is imminent and close to the project deadline', () => {
    const status = getDeadlineStatus(iso(2), iso(2));
    expect(status.isApproaching).toBe(true);
    expect(status.daysRemaining).toBe(0);
  });

  it('does not flag a task as approaching if its own deadline is imminent but far from the project deadline', () => {
    const status = getDeadlineStatus(iso(2), iso(30));
    expect(status.isApproaching).toBe(false);
  });

  it('still reports isOverdue when the task deadline is after the project deadline, regardless of today', () => {
    const status = getDeadlineStatus(iso(41), iso(35));
    expect(status.isOverdue).toBe(true);
  });

  it('returns no warning when either deadline is missing', () => {
    expect(getDeadlineStatus(undefined, iso(2)).isApproaching).toBe(false);
    expect(getDeadlineStatus(iso(2), undefined).isApproaching).toBe(false);
  });
});

describe('getTaskOverdueStatus', () => {
  it('flags a task whose deadline has already passed', () => {
    const status = getTaskOverdueStatus(iso(-3), 'TODO');
    expect(status.isPastDue).toBe(true);
    expect(status.daysOverdue).toBe(3);
  });

  it('does not flag a DONE task even if its deadline has passed', () => {
    const status = getTaskOverdueStatus(iso(-3), 'DONE');
    expect(status.isPastDue).toBe(false);
  });

  it('does not flag a task whose deadline is today or in the future', () => {
    expect(getTaskOverdueStatus(iso(0), 'TODO').isPastDue).toBe(false);
    expect(getTaskOverdueStatus(iso(1), 'TODO').isPastDue).toBe(false);
  });
});
