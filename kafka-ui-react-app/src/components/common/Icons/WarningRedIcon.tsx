import React from 'react';
import { useTheme } from 'styled-components';

const WarningRedIcon: React.FC = () => {
  const theme = useTheme();
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 20 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect
        width="20"
        height="20"
        rx="10"
        fill={theme.icons.warningRedIcon.rectFill}
      />
      <path
        d="M9 4.74219H11V12.7422H9V4.74219Z"
        fill={theme.icons.warningRedIcon.pathFill}
      />
      <path
        d="M9 14.7422C9 14.1899 9.44772 13.7422 10 13.7422C10.5523 13.7422 11 14.1899 11 14.7422C11 15.2945 10.5523 15.7422 10 15.7422C9.44772 15.7422 9 15.2945 9 14.7422Z"
        fill={theme.icons.warningRedIcon.pathFill}
      />
    </svg>
  );
};

export default WarningRedIcon;
