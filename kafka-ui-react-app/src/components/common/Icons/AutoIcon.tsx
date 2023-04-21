import React from 'react';
import { useTheme } from 'styled-components';

const AutoIcon: React.FC = () => {
  const theme = useTheme();
  return (
    <svg
      width="14"
      height="15"
      viewBox="0 0 14 15"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M7.92385 8.49072L7.03019 5.8418H6.97336L6.07796 8.49072H7.92385Z"
        fill={theme.icons.autoIcon}
      />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M7 14.7422C10.866 14.7422 14 11.6082 14 7.74219C14 3.87619 10.866 0.742188 7 0.742188C3.13401 0.742188 0 3.87619 0 7.74219C0 11.6082 3.13401 14.7422 7 14.7422ZM3.5 11.2422H5.14789L5.68745 9.646H8.3136L8.85211 11.2422H10.5L7.99264 4.24219H6.01091L3.5 11.2422Z"
        fill={theme.icons.autoIcon}
      />
    </svg>
  );
};

export default AutoIcon;
