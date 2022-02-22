import useOutsideClickRef from '@rooks/use-outside-click-ref';
import cx from 'classnames';
import React, { useCallback, useEffect, useMemo, useState } from 'react';

import * as S from './Dropdown.styled';

export interface DropdownProps {
  label: React.ReactNode;
  right?: boolean;
  up?: boolean;
  vElipsisVisble?: boolean;
}

const Dropdown: React.FC<DropdownProps> = ({
  label,
  right,
  up,
  children,
  vElipsisVisble,
}) => {
  const [active, setActive] = useState<boolean>(false);
  const [wrapperRef] = useOutsideClickRef(() => setActive(false));
  const onClick = useCallback(() => setActive(!active), [active]);

  useEffect(() => {
    if (vElipsisVisble && active === true) {
      setActive(false);
    }
  }, [vElipsisVisble]);

  const classNames = useMemo(
    () =>
      cx('dropdown', {
        'is-active': active,
        'is-right': right,
        'is-up': up,
      }),
    [active]
  );
  return (
    <div className={classNames} ref={wrapperRef}>
      <S.TriggerWrapper>
        <S.Trigger onClick={onClick}>{label}</S.Trigger>
      </S.TriggerWrapper>
      <div className="dropdown-menu" id="dropdown-menu" role="menu">
        <div className="dropdown-content has-text-left">{children}</div>
      </div>
    </div>
  );
};

export default Dropdown;
