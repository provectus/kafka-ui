import React from 'react';
import { useTimeFormat } from 'lib/hooks/api/timeFormat';

interface GlobalSettingsContextValue {
  timeStampFormat: string;
}

export const defaultGlobalSettingsValue = {
  timeStampFormat: 'DD.MM.YYYY HH:mm:ss',
};

export const GlobalSettingsContext =
  React.createContext<GlobalSettingsContextValue>(defaultGlobalSettingsValue);

export const GlobalSettingsProvider: React.FC<
  React.PropsWithChildren<unknown>
> = ({ children }) => {
  const { data } = useTimeFormat();

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
