import React from 'react';
import { useTheme } from 'styled-components';

const MoonIcon: React.FC = () => {
  const theme = useTheme();
  return (
    <svg
      width="11"
      height="11.99"
      viewBox="0 0 12 12"
      fill={theme.icons.moonIcon}
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M11.6624 9.31544C11.5535 9.32132 11.4438 9.3243 11.3334 9.3243C8.01971 9.3243 5.33342 6.63801 5.33342 3.3243C5.33342 2.09476 5.70325 0.951604 6.33775 0C3.17705 0.170804 0.666748 2.78781 0.666748 5.99113C0.666748 9.30484 3.35304 11.9911 6.66675 11.9911C8.75092 11.9911 10.5869 10.9285 11.6624 9.31544Z"
        fill={theme.icons.moonIcon}
      />
    </svg>
  );
};

export default MoonIcon;
