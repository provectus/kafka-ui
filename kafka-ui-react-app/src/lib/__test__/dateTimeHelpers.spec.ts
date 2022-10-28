import {
  passedTime,
  calculateTimer,
  formatMilliseconds,
} from 'lib/dateTimeHelpers';

const startedAt = 1664891890889;

describe('format Milliseconds', () => {
  it('hours > 0', () => {
    const result = formatMilliseconds(10000000);

    expect(result).toEqual('2h 46m');
  });
  it('minutes > 0', () => {
    const result = formatMilliseconds(1000000);

    expect(result).toEqual('16m 40s');
  });

  it('seconds > 0', () => {
    const result = formatMilliseconds(10000);

    expect(result).toEqual('10s');
  });

  it('milliseconds > 0', () => {
    const result = formatMilliseconds(100);

    expect(result).toEqual('100ms' || '0ms');
    expect(formatMilliseconds()).toEqual('0ms');
  });
});

describe('calculate timer', () => {
  it('time value < 10', () => {
    expect(passedTime(5)).toBeTruthy();
  });

  it('time value > 9', () => {
    expect(passedTime(10)).toBeTruthy();
  });

  it('run calculate time', () => {
    expect(calculateTimer(startedAt));
  });

  it('return when startedAt > new Date()', () => {
    expect(calculateTimer(1664891890889199)).toBe('00:00');
  });
});
