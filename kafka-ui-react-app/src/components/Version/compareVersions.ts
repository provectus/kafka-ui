const indexOrEnd = (str: string, q: string): number =>
  str.indexOf(q) === -1 ? str.length : str.indexOf(q);

const split = (v: string): string[] => {
  const c = v.replace(/^v/, '').replace(/\+.*$/, '');
  const patchIndex = indexOrEnd(c, '-');
  const arr = c.substring(0, patchIndex).split('.');
  return arr;
};

const compareVersions = (v1: string, v2: string): number => {
  const s1 = split(v1);
  const s2 = split(v2);

  for (let i = 0; i < Math.max(s1.length, s2.length); i += 1) {
    const n1 = parseInt(s1[i] || '0', 10);
    const n2 = parseInt(s2[i] || '0', 10);

    if (n1 > n2) return 1;
    if (n2 > n1) return -1;
  }

  return 0;
};

export default compareVersions;
