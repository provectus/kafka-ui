import React from 'react';

interface Props {
  value: string | number | undefined;
  precision?: number;
}

const BytesFormatted: React.FC<Props> = ({ value, precision = 0 }) => {
  const formatedValue = React.useMemo(() => {
    const bytes = typeof value === 'string' ? parseInt(value, 10) : value;

    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
    if (!bytes || bytes === 0) return [0, sizes[0]];

    if (bytes < 1024) return [Math.ceil(bytes), sizes[0]];

    const pow = Math.floor(Math.log2(bytes) / 10);
    const multiplier = 10 ** (precision || 2);
    return (
      Math.round((bytes * multiplier) / 1024 ** pow) / multiplier + sizes[pow]
    );
  }, [value]);

  return <span>{formatedValue}</span>;
};

export default BytesFormatted;
