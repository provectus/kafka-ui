import React from 'react';

// This is here for future global code settings modification , it does not do anything now
export const GlobalSettingsContext = React.createContext<boolean>(true);

export const GlobalSettingsProvider: React.FC<
  React.PropsWithChildren<unknown>
> = ({ children }) => {
  return (
    <GlobalSettingsContext.Provider value={false}>
      {children}
    </GlobalSettingsContext.Provider>
  );
};
