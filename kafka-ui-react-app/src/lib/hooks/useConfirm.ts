import { isPromise } from 'util/types';

import { ConfirmContext } from 'components/contexts/ConfirmContext';
import React, { useContext } from 'react';

export const useConfirm = () => {
  const context = useContext(ConfirmContext);

  return (message: React.ReactNode, callback: () => void | Promise<void>) => {
    context?.setContent(message);
    context?.setConfirm(() => async () => {
      if (isPromise(callback)) {
        await callback();
      } else {
        callback();
      }
      context?.cancel();
    });
  };
};
