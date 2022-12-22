import React from 'react';

// This is here for future global code settings modification , it does not do anything now
interface GlobalSettingsContextValue {
  defaultSettings?: string;
}

export const GlobalSettingsContext =
  React.createContext<GlobalSettingsContextValue>({});

export const GlobalSettingsProvider: React.FC<
  React.PropsWithChildren<unknown>
> = ({ children }) => {
  return (
    <GlobalSettingsContext.Provider value={{}}>
      {children}
    </GlobalSettingsContext.Provider>
  );
};
