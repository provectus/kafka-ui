import React from 'react';

interface Props {
  value: string | number | undefined;
  precision?: number;
}

const BytesFormatted: React.FC<Props> = ({ value, precision }) => {
  const formatBytes = React.useCallback(() => {
    const numVal = typeof value === 'string' ? parseInt(value, 10) : value;
    if (!numVal) return 0;
    const pow = Math.floor(Math.log2(numVal) / 10);
    const multiplier = 10 ** (precision || 2);
    return (
      Math.round((numVal * multiplier) / 1024 ** pow) / multiplier +
      ['Bytes', 'KB', 'MB', 'GB', 'TB'][pow]
    );
  }, [value]);
  return <span>{formatBytes()}</span>;
};

export default BytesFormatted;
