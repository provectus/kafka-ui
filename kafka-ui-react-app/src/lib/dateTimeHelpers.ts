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

export const formatMilliseconds = (input = 0) => {
  const milliseconds = Math.max(input || 0, 0);

  const seconds = Math.floor(milliseconds / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);

  if (hours > 0) {
    return `${hours}h ${minutes % 60}m`;
  }

  if (minutes > 0) {
    return `${minutes}m ${seconds % 60}s`;
  }

  if (seconds > 0) {
    return `${seconds}s`;
  }

  return `${milliseconds}ms`;
};

export const passedTime = (value: number) => (value < 10 ? `0${value}` : value);

export const calculateTimer = (startedAt: number) => {
  const now = new Date().getTime();
  const newDate = now - startedAt;
  const minutes = dayjs(newDate).minute();
  const second = dayjs(newDate).second();

  return newDate > 0 ? `${passedTime(minutes)}:${passedTime(second)}` : '00:00';
};
