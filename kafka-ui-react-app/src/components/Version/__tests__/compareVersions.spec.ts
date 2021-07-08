// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck

import compareVersions from 'components/Version/compareVersions';

describe('compareVersions function', () => {
  it('single-segment versions', () => {
    expect(compareVersions('10', '9')).toEqual(1);
    expect(compareVersions('10', '10')).toEqual(0);
    expect(compareVersions('9', '10')).toEqual(-1);
  });

  it('two-segment versions', () => {
    expect(compareVersions('10.8', '10.4')).toEqual(1);
    expect(compareVersions('10.1', '10.1')).toEqual(0);
    expect(compareVersions('10.1', '10.2')).toEqual(-1);
  });

  it('three-segment versions', () => {
    expect(compareVersions('10.1.8', '10.0.4')).toEqual(1);
    expect(compareVersions('10.0.1', '10.0.1')).toEqual(0);
    expect(compareVersions('10.1.1', '10.2.2')).toEqual(-1);
  });

  it('four-segment versions', () => {
    expect(compareVersions('1.0.0.0', '1')).toEqual(0);
    expect(compareVersions('1.0.0.0', '1.0')).toEqual(0);
    expect(compareVersions('1.0.0.0', '1.0.0')).toEqual(0);
    expect(compareVersions('1.0.0.0', '1.0.0.0')).toEqual(0);
    expect(compareVersions('1.2.3.4', '1.2.3.4')).toEqual(0);
    expect(compareVersions('1.2.3.4', '1.2.3.04')).toEqual(0);
    expect(compareVersions('v1.2.3.4', '01.2.3.4')).toEqual(0);

    expect(compareVersions('1.2.3.4', '1.2.3.5')).toEqual(-1);
    expect(compareVersions('1.2.3.5', '1.2.3.4')).toEqual(1);
    expect(compareVersions('1.0.0.0-alpha', '1.0.0-alpha')).toEqual(0);
    expect(compareVersions('1.0.0.0-alpha', '1.0.0.0-beta')).toEqual(0);
  });

  it('different number of digits in same group', () => {
    expect(compareVersions('11.0.10', '11.0.2')).toEqual(1);
    expect(compareVersions('11.0.2', '11.0.10')).toEqual(-1);
  });

  it('different number of digits in different groups', () => {
    expect(compareVersions('11.1.10', '11.0')).toEqual(1);
  });

  it('different number of digits', () => {
    expect(compareVersions('1.1.1', '1')).toEqual(1);
    expect(compareVersions('1.0.0', '1')).toEqual(0);
    expect(compareVersions('1.0', '1.4.1')).toEqual(-1);
  });

  it('ignore non-numeric characters', () => {
    expect(compareVersions('1.0.0-alpha.1', '1.0.0-alpha')).toEqual(0);
    expect(compareVersions('1.0.0-rc', '1.0.0')).toEqual(0);
    expect(compareVersions('1.0.0-alpha', '1')).toEqual(0);
    expect(compareVersions('v1.0.0', '1.0.0')).toEqual(0);
  });

  it('returns valid result (negative test cases)', () => {
    expect(compareVersions(123, 'v0.0.0')).toEqual(0);
    expect(compareVersions(undefined, 'v0.0.0')).toEqual(0);
    expect(compareVersions('v0.0.0', 123)).toEqual(0);
    expect(compareVersions('v0.0.0', undefined)).toEqual(0);
    expect(compareVersions(undefined, undefined)).toEqual(0);
  });
});
