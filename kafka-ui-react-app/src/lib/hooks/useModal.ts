import { useCallback, useState } from 'react';

interface UseModalReturn {
  isOpen: boolean;
  setOpen(): void;
  setClose(): void;
  toggle(): void;
}
const useModal = (initialModalState?: boolean): UseModalReturn => {
  const [modalOpen, setModalOpen] = useState<boolean>(!!initialModalState);

  const setOpen = useCallback(() => {
    setModalOpen(true);
  }, []);

  const setClose = useCallback(() => {
    setModalOpen(false);
  }, []);

  const toggle = useCallback(() => {
    setModalOpen((prev) => !prev);
  }, []);

  return {
    isOpen: modalOpen,
    setOpen,
    setClose,
    toggle,
  };
};

export default useModal;
