import { ConfirmContext } from 'components/contexts/ConfirmContext';
import React, { useContext } from 'react';

export const useConfirm = () => {
  const context = useContext(ConfirmContext);
  return (
    message: React.ReactNode,
    callback: () => void | Promise<unknown>
  ) => {
    context?.setContent(message);
    context?.setConfirm(() => async () => {
      await callback();
      context?.cancel();
    });
  };
};
