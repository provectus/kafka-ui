import React, { FC } from 'react';
import { useTheme } from 'styled-components';

const EditIcon: FC = () => {
  const theme = useTheme();
  return (
    <svg
      viewBox="0 0 64 64"
      width="12"
      height="12"
      xmlns="http://www.w3.org/2000/svg"
      aria-labelledby="title"
      aria-describedby="desc"
      role="img"
    >
      <title>Edit</title>
      <desc>A line styled icon from Orion Icon Library.</desc>
      <path
        d="M54.368 17.674l6.275-6.267-8.026-8.025-6.274 6.267"
        strokeWidth="2"
        strokeMiterlimit="10"
        stroke={theme.icons.editIcon}
        fill="none"
        data-name="layer2"
        strokeLinejoin="round"
        strokeLinecap="round"
      />
      <path
        d="M17.766 54.236l36.602-36.562-8.025-8.025L9.74 46.211 3.357 60.618l14.409-6.382zM9.74 46.211l8.026 8.025"
        strokeWidth="2"
        strokeMiterlimit="10"
        stroke={theme.icons.editIcon}
        fill="none"
        data-name="layer1"
        strokeLinejoin="round"
        strokeLinecap="round"
      />
    </svg>
  );
};

export default EditIcon;
