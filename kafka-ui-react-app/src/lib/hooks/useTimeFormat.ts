import { useContext } from 'react';
import { formatTimestamp } from 'lib/dateTimeHelpers';
import { GlobalSettingsContext } from 'components/contexts/GlobalSettingsContext';

export const useTimeFormat = () => {
  const { timeStampFormat } = useContext(GlobalSettingsContext);

  return (timestamp?: number | string | Date, format?: string) =>
    formatTimestamp(timestamp, format || timeStampFormat);
};
