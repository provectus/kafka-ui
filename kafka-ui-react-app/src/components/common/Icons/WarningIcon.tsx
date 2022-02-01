import React from 'react';
import styled, { useTheme } from 'styled-components';

const WarningIconContainer = styled.span`
  align-items: center;
  display: inline-flex;
  justify-content: center;
  height: 1.5rem;
  width: 1.5rem;
`;

const WarningIcon: React.FC = () => {
  const theme = useTheme();

  return (
    <WarningIconContainer>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        version="1.0"
        width="18px"
        height="16px"
        viewBox="0 0 1280.000000 1126.000000"
        preserveAspectRatio="xMidYMid meet"
      >
        <g
          transform="translate(0.000000,1126.000000) scale(0.100000,-0.100000)"
          fill={theme.icons.warningIcon}
          stroke="none"
        >
          <path d="M6201 11240 c-41 -10 -113 -37 -160 -61 -70 -35 -105 -62 -187 -144 -61 -60 -124 -134 -157 -185 -85 -132 -681 -1182 -2962 -5215 -793 -1402 -1714 -3032 -2047 -3620 -333 -589 -617 -1098 -631 -1131 -79 -187 -72 -394 19 -559 15 -28 64 -86 108 -130 91 -90 177 -139 306 -175 l76 -20 5879 2 5880 3 81 27 c363 124 494 499 304 878 -21 43 -899 1580 -1951 3417 -1052 1836 -2308 4029 -2791 4873 -484 844 -909 1580 -946 1635 -118 177 -268 311 -419 373 -125 52 -272 64 -402 32z m1607 -3410 c793 -1383 2019 -3523 2724 -4755 l1283 -2240 -2712 -3 c-1492 -1 -3934 -1 -5427 0 l-2715 3 1666 2945 c3188 5637 3725 6583 3734 6572 4 -4 655 -1139 1447 -2522z" />
          <path d="M6290 7874 c-14 -3 -61 -14 -104 -25 -390 -98 -706 -474 -706 -837 0 -46 22 -254 50 -461 27 -207 113 -857 190 -1446 201 -1535 199 -1517 216 -1581 42 -165 141 -297 271 -361 67 -33 86 -38 168 -41 152 -7 246 30 348 136 99 105 144 224 176 464 11 84 61 462 111 841 49 378 131 996 180 1375 50 378 100 756 111 840 24 182 25 305 4 387 -82 323 -360 599 -693 686 -75 20 -266 33 -322 23z" />
          <path d="M6322 2739 c-345 -44 -594 -371 -552 -726 20 -166 86 -301 204 -410 114 -107 237 -160 391 -170 187 -11 336 47 475 187 134 134 192 273 193 465 1 116 -13 183 -58 280 -120 261 -379 409 -653 374z" />
        </g>
      </svg>
    </WarningIconContainer>
  );
};

export default WarningIcon;
