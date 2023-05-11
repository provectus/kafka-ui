import React, { useState } from 'react';

interface ConfirmContextType {
  content: React.ReactNode;
  confirm?: () => void;
  setContent: React.Dispatch<React.SetStateAction<React.ReactNode>>;
  setConfirm: React.Dispatch<React.SetStateAction<(() => void) | undefined>>;
  cancel: () => void;
  dangerButton: boolean;
  setDangerButton: React.Dispatch<React.SetStateAction<boolean>>;
}

export const ConfirmContext = React.createContext<ConfirmContextType | null>(
  null
);

export const ConfirmContextProvider: React.FC<
  React.PropsWithChildren<unknown>
> = ({ children }) => {
  const [content, setContent] = useState<React.ReactNode>(null);
  const [confirm, setConfirm] = useState<(() => void) | undefined>(undefined);
  const [dangerButton, setDangerButton] = useState(false);

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
        dangerButton,
        setDangerButton,
      }}
    >
      {children}
    </ConfirmContext.Provider>
  );
};
