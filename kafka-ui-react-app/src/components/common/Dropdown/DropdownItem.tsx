import React, { PropsWithChildren } from 'react';
import { ClickEvent, MenuItem, MenuItemProps } from '@szhsin/react-menu';
import { useConfirm } from 'lib/hooks/useConfirm';

import * as S from './Dropdown.styled';

export interface DropdownItemProps extends PropsWithChildren<MenuItemProps> {
  danger?: boolean;
  onClick?(): void;
  confirm?: React.ReactNode;
}

const DropdownItem = React.forwardRef<unknown, DropdownItemProps>(
  ({ onClick, danger, children, confirm, ...rest }, ref) => {
    const confirmation = useConfirm();

    const handleClick = (e: ClickEvent) => {
      if (!onClick) return;

      // eslint-disable-next-line no-param-reassign
      e.stopPropagation = true;
      e.syntheticEvent.stopPropagation();

      if (confirm) {
        confirmation(confirm, onClick);
      } else {
        onClick();
      }
    };

    return (
      <MenuItem onClick={handleClick} {...rest} ref={ref}>
        {danger ? <S.DangerItem>{children}</S.DangerItem> : children}
      </MenuItem>
    );
  }
);

export default DropdownItem;
