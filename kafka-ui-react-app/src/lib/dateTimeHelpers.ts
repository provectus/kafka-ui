import dayjs from 'dayjs';

export const formatTimestamp = (
  timestamp: number | string | Date | undefined,
  format?: string
): string => {
  if (!timestamp) {
    return '';
  }

  return dayjs(timestamp).format(format);
};
