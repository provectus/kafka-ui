import React from 'react';
import { useTheme } from 'styled-components';

const InfoIcon: React.FC = () => {
  const theme = useTheme();
  return (
    <svg
      width="14"
      height="15"
      viewBox="0 0 14 15"
      fill="red"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M7 1.81911C3.72878 1.81911 1.07692 4.47096 1.07692 7.74219C1.07692 11.0134 3.72878 13.6653 7 13.6653C10.2712 13.6653 12.9231 11.0134 12.9231 7.74219C12.9231 4.47096 10.2712 1.81911 7 1.81911ZM0 7.74219C0 3.87619 3.13401 0.742188 7 0.742188C10.866 0.742188 14 3.87619 14 7.74219C14 11.6082 10.866 14.7422 7 14.7422C3.13401 14.7422 0 11.6082 0 7.74219Z"
        fill={theme.icons.infoIcon}
      />
      <path
        d="M6 4.74219C6 4.1899 6.44772 3.74219 7 3.74219C7.55228 3.74219 8 4.1899 8 4.74219V7.74219C8 8.29447 7.55228 8.74219 7 8.74219C6.44772 8.74219 6 8.29447 6 7.74219V4.74219Z"
        fill={theme.icons.infoIcon}
      />
      <path
        d="M6 11.2422C6 10.6899 6.44772 10.2422 7 10.2422C7.55228 10.2422 8 10.6899 8 11.2422C8 11.7945 7.55228 12.2422 7 12.2422C6.44772 12.2422 6 11.7945 6 11.2422Z"
        fill={theme.icons.infoIcon}
      />
    </svg>
  );
};

export default InfoIcon;
