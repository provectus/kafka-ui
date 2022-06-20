import React from 'react';
import { useTheme } from 'styled-components';

interface Props {
  isOpen: boolean;
}

const DropdownArrowIcon: React.FC<Props> = ({ isOpen }) => {
  const theme = useTheme();

  return (
    <svg
      width="24"
      height="24"
      fill="none"
      style={{ position: 'absolute', right: '5px' }}
      stroke="currentColor"
      strokeWidth="2"
      color={theme.icons.dropdownArrowIcon}
      transform={isOpen ? 'rotate(180)' : ''}
    >
      <path d="M6 9L12 15 18 9" />
    </svg>
  );
};

export default DropdownArrowIcon;
