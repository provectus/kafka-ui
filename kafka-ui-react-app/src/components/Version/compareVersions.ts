const split = (v: string): string[] => {
  const c = v.replace(/^v/, '').replace(/\+.*$/, '');
  return c.split('-')[0].split('.');
};

const compareVersions = (v1: string, v2: string): number => {
  try {
    const s1 = split(v1);
    const s2 = split(v2);

    for (let i = 0; i < Math.max(s1.length, s2.length); i += 1) {
      const n1 = parseInt(s1[i] || '0', 10);
      const n2 = parseInt(s2[i] || '0', 10);

      if (n1 > n2) return 1;
      if (n2 > n1) return -1;
    }

    return 0;
  } catch (_) {
    return 0;
  }
};

export default compareVersions;
