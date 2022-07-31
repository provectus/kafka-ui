import React from 'react';
import { useTheme } from 'styled-components';

const SpinnerIcon: React.FC = () => {
  const theme = useTheme();
  return (
    <svg
      width="30"
      height="30"
      viewBox="0 0 120 30"
      xmlns="http://www.w3.org/2000/svg"
      fill={theme.pageLoader.borderColor}
    >
      {/* By Sam Herbert (@sherb), for everyone. More @ http://goo.gl/7AJzbL */}
      <circle cx="15" cy="15" r="15">
        <animate
          attributeName="r"
          from="15"
          to="15"
          begin="0s"
          dur="0.8s"
          values="15;9;15"
          calcMode="linear"
          repeatCount="indefinite"
        />
        <animate
          attributeName="fill-opacity"
          from="1"
          to="1"
          begin="0s"
          dur="0.8s"
          values="1;.5;1"
          calcMode="linear"
          repeatCount="indefinite"
        />
      </circle>
      <circle cx="60" cy="15" r="9" fillOpacity="0.3">
        <animate
          attributeName="r"
          from="9"
          to="9"
          begin="0s"
          dur="0.8s"
          values="9;15;9"
          calcMode="linear"
          repeatCount="indefinite"
        />
        <animate
          attributeName="fill-opacity"
          from="0.5"
          to="0.5"
          begin="0s"
          dur="0.8s"
          values=".5;1;.5"
          calcMode="linear"
          repeatCount="indefinite"
        />
      </circle>
      <circle cx="105" cy="15" r="15">
        <animate
          attributeName="r"
          from="15"
          to="15"
          begin="0s"
          dur="0.8s"
          values="15;9;15"
          calcMode="linear"
          repeatCount="indefinite"
        />
        <animate
          attributeName="fill-opacity"
          from="1"
          to="1"
          begin="0s"
          dur="0.8s"
          values="1;.5;1"
          calcMode="linear"
          repeatCount="indefinite"
        />
      </circle>
    </svg>
  );
};

export default SpinnerIcon;

// {
//   /* <svg
//       width="16"
//       height="16"
//       viewBox="0 0 16 16"
//       fill="none"
//       xmlns="http://www.w3.org/2000/svg"
//       role="progressbar"
//       aria-label="Loading"
//     >
//       <path
//         fillRule="evenodd"
//         clipRule="evenodd"
//         d="M8 16C12.4183 16 16 12.4183 16 8C16 3.58172 12.4183 0 8 0C3.58172 0 0 3.58172 0 8C0 12.4183 3.58172 16 8 16ZM11.707 4.29289C12.0976 4.68342 12.0976 5.31658 11.707 5.70711L9.41415 8L11.707 10.2929C12.0976 10.6834 12.0976 11.3166 11.707 11.7071C11.3165 12.0976 10.6834 12.0976 10.2928 11.7071L7.99994 9.41421L5.70711 11.707C5.31658 12.0976 4.68342 12.0976 4.29289 11.707C3.90237 11.3165 3.90237 10.6834 4.29289 10.2928L6.58573 8L4.29289 5.70717C3.90237 5.31664 3.90237 4.68348 4.29289 4.29295C4.68342 3.90243 5.31658 3.90243 5.70711 4.29295L7.99994 6.58579L10.2928 4.29289C10.6834 3.90237 11.3165 3.90237 11.707 4.29289Z"
//         fill={theme.icons.closeIcon}
//       />
//     </svg> */
// }
