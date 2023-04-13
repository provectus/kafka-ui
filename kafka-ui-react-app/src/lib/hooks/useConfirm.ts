import { ConfirmContext } from 'components/contexts/ConfirmContext';
import React, { useContext } from 'react';

export const useConfirm = (danger = false) => {
  const context = useContext(ConfirmContext);
  return (
    message: React.ReactNode,
    callback: () => void | Promise<unknown>
  ) => {
    context?.setDangerButton(danger);
    context?.setContent(message);
    context?.setConfirm(() => async () => {
      await callback();
      context?.cancel();
    });
  };
};
