import React from 'react';
import Overlay, { OverlayProps } from 'components/common/Overlay/Overlay';
import CloseIcon from 'components/common/Icons/CloseIcon';

import {
  CloseIconWrapper,
  ModalSizes,
  Wrapper,
  Header,
} from './ModalStyled.styled';

interface ModalProps extends OverlayProps {
  size?: ModalSizes;
  header?: string;
  isCloseIcon?: boolean;
  transparent?: boolean;
}

export const Modal: React.FC<React.PropsWithChildren<ModalProps>> = ({
  children,
  open,
  portal = true,
  header,
  isCloseIcon,
  onClose,
  transparent = false,
}) => {
  return (
    <Overlay backdrop onClose={onClose} open={open} portal={portal}>
      <Wrapper transparent={transparent}>
        {isCloseIcon && (
          <CloseIconWrapper>
            <CloseIcon />
          </CloseIconWrapper>
        )}
        {header && <Header>{header}</Header>}
        {children}
      </Wrapper>
    </Overlay>
  );
};
