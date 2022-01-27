import React from 'react';

import { CustomButtonIconContainer } from './CustomButtonIcons.styled';

const ButtonRightChevronIcon: React.FC = () => {
  return (
    <CustomButtonIconContainer>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 32 24"
        fill="none"
      >
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M7.85425 0L5 2.82L14.2713 12L5 21.18L7.85425 24L20 12L7.85425 0Z"
          fill="#2B2C3C"
        />
      </svg>
    </CustomButtonIconContainer>
  );
};

export default ButtonRightChevronIcon;
