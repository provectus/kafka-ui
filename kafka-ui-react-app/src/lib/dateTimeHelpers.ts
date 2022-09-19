import dayjs from 'dayjs';

export const formatTimestamp = (
  timestamp: number | string | Date | undefined,
  format?: string
): string => {
  const newFormat =
    format && format.slice(0, 2).toLocaleUpperCase() + format.slice(2);

  if (!timestamp) {
    return '';
  }

  return dayjs(timestamp).format(newFormat);
};
