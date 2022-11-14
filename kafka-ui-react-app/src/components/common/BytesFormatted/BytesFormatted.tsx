import React from 'react';

import { NoWrap } from './BytesFormatted.styled';

interface Props {
  value: string | number | undefined;
  precision?: number;
}

export const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];

const BytesFormatted: React.FC<Props> = ({ value, precision = 0 }) => {
  const formattedValue = React.useMemo((): string => {
    try {
      const bytes = typeof value === 'string' ? parseInt(value, 10) : value;
      if (Number.isNaN(bytes) || (bytes && bytes < 0)) return `-Bytes`;
      if (!bytes || bytes < 1024) return `${Math.ceil(bytes || 0)} ${sizes[0]}`;
      const pow = Math.floor(Math.log2(bytes) / 10);
      const multiplier = 10 ** (precision < 0 ? 0 : precision);
      return `${Math.round((bytes * multiplier) / 1024 ** pow) / multiplier} ${
        sizes[pow]
      }`;
    } catch (e) {
      return `-Bytes`;
    }
  }, [precision, value]);

  return <NoWrap>{formattedValue}</NoWrap>;
};

export default BytesFormatted;
