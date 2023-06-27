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
      width="16"
      height="17"
      viewBox="0 0 16 17"
      fill="currentColor"
      stroke="currentColor"
      xmlns="http://www.w3.org/2000/svg"
      color={theme.icons.dropdownArrowIcon}
      transform={isOpen ? 'rotate(180)' : ''}
    >
      <path
        d="M3.64645 6.14645C3.84171 5.95118 4.15829 5.95118 4.35355 6.14645L8 9.79289L11.6464 6.14645C11.8417 5.95118 12.1583 5.95118 12.3536 6.14645C12.5488 6.34171 12.5488 6.65829 12.3536 6.85355L8.35355 10.8536C8.15829 11.0488 7.84171 11.0488 7.64645 10.8536L3.64645 6.85355C3.45118 6.65829 3.45118 6.34171 3.64645 6.14645Z"
      />
    </svg>
  );
};

export default DropdownArrowIcon;
