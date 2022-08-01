import { MenuProps } from '@szhsin/react-menu';
import React, { PropsWithChildren, useRef } from 'react';
import VerticalElipsisIcon from 'components/common/Icons/VerticalElipsisIcon';
import useModal from 'lib/hooks/useModal';

import * as S from './Dropdown.styled';

interface DropdownProps extends PropsWithChildren<Partial<MenuProps>> {
  label?: React.ReactNode;
}

const Dropdown: React.FC<DropdownProps> = ({ label, children }) => {
  const ref = useRef(null);
  const { isOpen, setClose, setOpen } = useModal(false);

  const handleClick: React.MouseEventHandler<HTMLButtonElement> = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setOpen();
  };

  return (
    <>
      <S.DropdownButton
        onClick={handleClick}
        ref={ref}
        aria-label="Dropdown Toggle"
      >
        {label || <VerticalElipsisIcon />}
      </S.DropdownButton>
      <S.Dropdown
        anchorRef={ref}
        state={isOpen ? 'open' : 'closed'}
        onMouseLeave={setClose}
        onClose={setClose}
        align="end"
        direction="bottom"
        offsetY={10}
        viewScroll="auto"
      >
        {children}
      </S.Dropdown>
    </>
  );
};

export default Dropdown;
