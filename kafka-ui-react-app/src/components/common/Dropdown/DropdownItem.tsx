import React, { PropsWithChildren } from 'react';
import { MenuItem, MenuItemProps } from '@szhsin/react-menu';

import * as S from './Dropdown.styled';

interface DropdownItemProps extends PropsWithChildren<MenuItemProps> {
  danger?: boolean;
  onClick(): void;
}

const DropdownItem: React.FC<DropdownItemProps> = ({
  onClick,
  danger,
  children,
  ...rest
}) => {
  return (
    <MenuItem onClick={onClick} {...rest}>
      {danger ? <S.DangerItem>{children}</S.DangerItem> : children}
    </MenuItem>
  );
};

export default DropdownItem;
