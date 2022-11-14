import React from 'react';

const InfoIcon: React.FC = () => {
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
      <desc>A line styled icon from Orion Icon Library.</desc>
      <circle
        data-name="layer2"
        cx="32"
        cy="32"
        r="30"
        fill="none"
        stroke="#202020"
        strokeMiterlimit="10"
        strokeWidth="2"
        strokeLinejoin="round"
        strokeLinecap="round"
      />
      <path
        data-name="layer1"
        fill="none"
        stroke="#202020"
        strokeMiterlimit="10"
        strokeWidth="2"
        d="M28 26h4v22m-4 .008h8"
        strokeLinejoin="round"
        strokeLinecap="round"
      />
      <circle
        data-name="layer1"
        cx="31"
        cy="19"
        r="2"
        fill="none"
        stroke="#202020"
        strokeMiterlimit="10"
        strokeWidth="2"
        strokeLinejoin="round"
        strokeLinecap="round"
      />
    </svg>
  );
};

export default InfoIcon;
