import React from 'react';
import { useTimeFormatStats } from 'lib/hooks/api/timeFormat';

type GlobalSettingsType = {
  timeStampFormat: string;
};

export const defaultGlobalSettingsValue = {
  timeStampFormat: 'DD.MM.YYYY HH:mm:ss',
};

export const GlobalSettingsContext = React.createContext<GlobalSettingsType>(
  defaultGlobalSettingsValue
);

export const GlobalSettingsProvider: React.FC<
  React.PropsWithChildren<unknown>
> = ({ children }) => {
  const { data } = useTimeFormatStats();

  return (
    <GlobalSettingsContext.Provider
      value={{
        timeStampFormat:
          data?.timeStampFormat || defaultGlobalSettingsValue.timeStampFormat,
      }}
    >
      {children}
    </GlobalSettingsContext.Provider>
  );
};
