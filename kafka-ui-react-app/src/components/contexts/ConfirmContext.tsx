import React, { useState } from 'react';

type ConfirmContextType = {
  content: React.ReactNode;
  confirm?: () => void;
  setContent: React.Dispatch<React.SetStateAction<React.ReactNode>>;
  setConfirm: React.Dispatch<React.SetStateAction<(() => void) | undefined>>;
  cancel: () => void;
};

export const ConfirmContext = React.createContext<ConfirmContextType | null>(
  null
);

export const ConfirmContextProvider: React.FC<
  React.PropsWithChildren<unknown>
> = ({ children }) => {
  const [content, setContent] = useState<React.ReactNode>(null);
  const [confirm, setConfirm] = useState<(() => void) | undefined>(undefined);

  const cancel = () => {
    setContent(null);
    setConfirm(undefined);
  };

  return (
    <ConfirmContext.Provider
      value={{
        content,
        setContent,
        confirm,
        setConfirm,
        cancel,
      }}
    >
      {children}
    </ConfirmContext.Provider>
  );
};
