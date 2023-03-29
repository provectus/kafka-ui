import React, { FC } from 'react';

const CheckmarkIcon: FC = () => {
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
      <title>Checkmark</title>
      <desc>A line styled icon from Orion Icon Library.</desc>
      <path
        data-name="layer1"
        fill="none"
        stroke="#FFFFFF"
        strokeMiterlimit="10"
        strokeWidth="2"
        d="M2 30l21 22 39-40"
        strokeLinejoin="round"
        strokeLinecap="round"
      />
    </svg>
  );
};

export default CheckmarkIcon;
