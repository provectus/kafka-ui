import { useContext } from 'react';
import { formatTimestamp } from 'lib/dateTimeHelpers';
import { TimeFormatContext } from 'components/contexts/TimeFormatContext';

export const useTimeFormat = (
  timestamp: number | string | Date | undefined
) => {
  const { timeStampFormat } = useContext(TimeFormatContext);

  return formatTimestamp(timestamp, timeStampFormat);
};
