import useOutsideClickRef from '@rooks/use-outside-click-ref';
import cx from 'classnames';
import styled from 'styled-components';
import React, { useCallback, useMemo, useState } from 'react';

import DropdownTrigger from './DropdownTrigger';

export interface DropdownProps {
  label: React.ReactNode;
  right?: boolean;
  up?: boolean;
}

const DropdowTriggerWrapper = styled.div`
  display: flex;
  align-self: center;
`;

const Dropdown: React.FC<DropdownProps> = ({ label, right, up, children }) => {
  const [active, setActive] = useState<boolean>(false);
  const [wrapperRef] = useOutsideClickRef(() => setActive(false));
  const onClick = useCallback(() => setActive(!active), [active]);

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
      <DropdowTriggerWrapper>
        <DropdownTrigger onClick={onClick}>{label}</DropdownTrigger>
      </DropdowTriggerWrapper>
      <div className="dropdown-menu" id="dropdown-menu" role="menu">
        <div className="dropdown-content has-text-left">{children}</div>
      </div>
    </div>
  );
};

export default Dropdown;
