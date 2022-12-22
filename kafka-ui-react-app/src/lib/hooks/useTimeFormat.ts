import { formatTimestamp } from 'lib/dateTimeHelpers';

export const useTimeFormat = () => {
  return (
    timestamp?: number | string | Date,
    format?: Intl.DateTimeFormatOptions
  ) => formatTimestamp(timestamp, format);
};
