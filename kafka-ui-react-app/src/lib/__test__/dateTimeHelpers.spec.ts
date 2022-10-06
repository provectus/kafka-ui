import { calculateTimer, formatMilliseconds } from 'lib/dateTimeHelpers';

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
  const startedAt = 1664891890889;

  const passedTimeMck = jest.fn((value: number) => {
    return value < 10 ? `0${value}` : value;
  });

  expect(calculateTimer(startedAt));
  expect(passedTimeMck(5)).toBeTruthy();
  expect(passedTimeMck(10)).toBeTruthy();
});
