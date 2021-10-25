import React, { useCallback } from 'react';

export interface DropdownItemProps {
  onClick(): void;
  style?: React.CSSProperties;
}

const DropdownItem: React.FC<DropdownItemProps> = ({
  onClick,
  style,
  children,
}) => {
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
      style={style}
    >
      {children}
    </a>
  );
};

export default DropdownItem;
