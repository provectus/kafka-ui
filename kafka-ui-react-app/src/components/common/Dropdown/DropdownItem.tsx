import React, { useCallback } from 'react';

export interface DropdownItemProps {
  onClick(): void;
}

const DropdownItem: React.FC<DropdownItemProps> = ({ onClick, children }) => {
  const onClickHandler = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      onClick();
    },
    [onClick]
  );
  return (
    <a
      href="#end"
      onClick={onClickHandler}
      className="dropdown-item is-link"
      role="menuitem"
      type="button"
    >
      {children}
    </a>
  );
};

export default DropdownItem;
