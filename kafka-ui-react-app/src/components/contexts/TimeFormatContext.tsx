import React from 'react';
import { TimeStampFormat } from 'generated-sources';
import { useTimeFormatStats } from 'lib/hooks/api/timeFormat';

type TimeFormatContextType = {
  timeStampFormat?: string;
};

export const TimeFormatContext = React.createContext<TimeFormatContextType>(
  {} as TimeFormatContextType
);

export const TimeFormatContextProvider: React.FC<
  React.PropsWithChildren<unknown>
> = ({ children }) => {
  const { data: timeFormat } = useTimeFormatStats();
  const { timeStampFormat } = timeFormat as TimeStampFormat;

  return (
    <TimeFormatContext.Provider
      value={{
        timeStampFormat,
      }}
    >
      {children}
    </TimeFormatContext.Provider>
  );
};
