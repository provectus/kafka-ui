import compareVersions from 'components/Version/compareVersions';

const runTests = (dataSet: [string, string, number][]) => {
  dataSet.forEach(([v1, v2, expected]) => {
    expect(compareVersions(v1, v2)).toEqual(expected);
  });
};

describe('compareVersions function', () => {
  it('single-segment versions', () => {
    runTests([
      ['10', '9', 1],
      ['10', '10', 0],
      ['9', '10', -1],
    ]);
  });

  it('two-segment versions', () => {
    runTests([
      ['10.8', '10.4', 1],
      ['10.1', '10.2', -1],
      ['10.1', '10.1', 0],
    ]);
  });

  it('three-segment versions', () => {
    runTests([
      ['10.1.1', '10.2.2', -1],
      ['10.1.8', '10.0.4', 1],
      ['10.0.1', '10.0.1', 0],
    ]);
  });

  it('different number of digits in same group', () => {
    runTests([
      ['11.0.10', '11.0.2', 1],
      ['11.0.2', '11.0.10', -1],
    ]);
  });

  it('different number of digits in different groups', () => {
    expect(compareVersions('11.1.10', '11.0')).toEqual(1);
  });

  it('different number of digits', () => {
    runTests([
      ['1.1.1', '1', 1],
      ['1.0.0', '1', 0],
      ['1.0', '1.4.1', -1],
    ]);
  });

  it('ignore non-numeric characters', () => {
    runTests([
      ['1.0.0-alpha.1', '1.0.0-alpha', 0],
      ['1.0.0-rc', '1.0.0', 0],
      ['1.0.0-alpha', '1', 0],
      ['v1.0.0', '1.0.0', 0],
    ]);
  });

  it('returns valid result (negative test cases)', () => {
    expect(compareVersions()).toEqual(0);
    expect(compareVersions('v0.0.0')).toEqual(0);
    // @ts-expect-error first arg is number
    expect(compareVersions(123, 'v0.0.0')).toEqual(0);
    // @ts-expect-error second arg is number
    expect(compareVersions('v0.0.0', 123)).toEqual(0);
  });
});
