import styled from 'styled-components';
import React from 'react';

interface Props {
  className?: string;
  onClick: () => void;
}

const DropdownTrigger: React.FC<Props> = ({ onClick, className, children }) => {
  return (
    <button
      className={className}
      type="button"
      aria-haspopup="true"
      aria-controls="dropdown-menu"
      onClick={onClick}
    >
      {children}
    </button>
  );
};

export default styled(DropdownTrigger)`
  background: transparent;
  border: none;
  display: flex;
  align-items: 'center';
  justify-content: 'center';
  &:hover {
    cursor: pointer;
  }
`;
