import React, { SyntheticEvent } from 'react';
import styled from 'styled-components';
import Backdrop from 'components/common/Backdrop/Backdrop';
import Portal from 'components/common/Portal/Portal';

export interface OverlayProps {
  backdrop?: boolean;
  open?: boolean;
  portal?: boolean;
  onClose?: (e: SyntheticEvent<HTMLElement>) => void;
}

const Wrapper = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  bottom: 0;
  right: 0;
  z-index: 1100;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  pointer-events: none;

  > * {
    pointer-events: auto;
  }
`;

const Overlay: React.FC<React.PropsWithChildren<OverlayProps>> = ({
  children,
  backdrop,
  open,
  portal,
  onClose,
}) => {
  if (!open) {
    return null;
  }

  return (
    <Portal conditional={portal}>
      <Wrapper>
        {backdrop && <Backdrop onClick={onClose} open={open} />}
        {children}
      </Wrapper>
    </Portal>
  );
};

export default Overlay;
