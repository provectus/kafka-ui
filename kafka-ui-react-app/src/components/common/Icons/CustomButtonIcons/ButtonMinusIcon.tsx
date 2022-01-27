import React from 'react';

import { CustomButtonIconContainer } from './CustomButtonIcons.styled';

const ButtonMinusIcon: React.FC = () => {
  return (
    <CustomButtonIconContainer>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 16 16"
        fill="none"
      >
        <path
          d="M12 9.00006C12.5523 9.00006 13 8.55235 13 8.00006C13 7.44778 12.5523 7.00006 12 7.00006H4C3.44772 7.00006 3 7.44778 3 8.00006C3 8.55235 3.44772 9.00006 4 9.00006H12Z"
          fill="#171A1C"
        />
      </svg>
    </CustomButtonIconContainer>
  );
};

export default ButtonMinusIcon;
