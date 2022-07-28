import React, { PropsWithChildren } from 'react';
import { ClickEvent, MenuItem, MenuItemProps } from '@szhsin/react-menu';

import * as S from './Dropdown.styled';

interface DropdownItemProps extends PropsWithChildren<MenuItemProps> {
  danger?: boolean;
  onClick?(): void;
}

const DropdownItem: React.FC<DropdownItemProps> = ({
  onClick,
  danger,
  children,
  ...rest
}) => {
  const handleClick = (e: ClickEvent) => {
    if (!onClick) return;

    // eslint-disable-next-line no-param-reassign
    e.stopPropagation = true;
    e.syntheticEvent.stopPropagation();
    onClick();
  };

  return (
    <MenuItem onClick={handleClick} {...rest}>
      {danger ? <S.DangerItem>{children}</S.DangerItem> : children}
    </MenuItem>
  );
};

export default DropdownItem;
