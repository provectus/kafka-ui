import dayjs from 'dayjs';

export const formatTimestamp = (
  timestamp: number | string | Date | undefined,
  format = 'MM.DD.YY hh:mm:ss a'
): string => {
  if (!timestamp) {
    return '';
  }

  return dayjs(timestamp).format(format);
};
