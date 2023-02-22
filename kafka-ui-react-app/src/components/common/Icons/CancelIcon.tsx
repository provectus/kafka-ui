import React from 'react';
import { useTheme } from 'styled-components';

const CancelIcon: React.FC = () => {
  const theme = useTheme();
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 64 64"
      width="12"
      height="12"
      aria-labelledby="title"
      aria-describedby="desc"
      role="img"
    >
      <title>Cancel</title>
      <desc>A line styled icon from Orion Icon Library.</desc>
      <path
        data-name="layer1"
        d="M53.122 48.88L36.243 32l16.878-16.878a3 3 0 0 0-4.242-4.242L32 27.758l-16.878-16.88a3 3 0 0 0-4.243 4.243l16.878 16.88-16.88 16.88a3 3 0 0 0 4.243 4.241L32 36.243l16.878 16.88a3 3 0 0 0 4.244-4.243z"
        fill="none"
        stroke={theme.icons.cancelIcon}
        strokeMiterlimit="10"
        strokeWidth="2"
        strokeLinejoin="round"
        strokeLinecap="round"
      />
    </svg>
  );
};

export default CancelIcon;
