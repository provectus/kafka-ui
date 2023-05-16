import React, { CSSProperties } from 'react';
import { useTheme } from 'styled-components';

interface Props {
  isOpen: boolean;
  style?: CSSProperties;
  color?: string;
}

const DropdownArrowIcon: React.FC<Props> = ({ isOpen }) => {
  const theme = useTheme();

  return (
    <svg
      width="10"
      height="5"
      viewBox="0 0 10 5"
      fill="currentColor"
      stroke="currentColor"
      xmlns="http://www.w3.org/2000/svg"
      color={theme.icons.dropdownArrowIcon}
      transform={isOpen ? 'rotate(180)' : ''}
    >
      <path d="M0.646447 0.146447C0.841709 -0.0488155 1.15829 -0.0488155 1.35355 0.146447L5 3.79289L8.64645 0.146447C8.84171 -0.0488155 9.15829 -0.0488155 9.35355 0.146447C9.54882 0.341709 9.54882 0.658291 9.35355 0.853553L5.35355 4.85355C5.15829 5.04882 4.84171 5.04882 4.64645 4.85355L0.646447 0.853553C0.451184 0.658291 0.451184 0.341709 0.646447 0.146447Z" />
    </svg>
  );
};

export default DropdownArrowIcon;
