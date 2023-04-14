import React from 'react';
import styled from 'styled-components';

const WarningIconContainer = styled.span`
  align-items: center;
  display: inline-flex;
  justify-content: center;
  height: 1.5rem;
  width: 1.5rem;
`;

const WarningIcon: React.FC = () => {
  return (
    <WarningIconContainer>
      <svg
        role="img"
        width="14"
        height="13"
        viewBox="0 0 14 13"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M8.09265 1.06679C7.60703 0.250524 6.39297 0.250524 5.90735 1.06679L0.170916 10.7089C-0.314707 11.5252 0.292322 12.5455 1.26357 12.5455H12.7364C13.7077 12.5455 14.3147 11.5252 13.8291 10.7089L8.09265 1.06679ZM6 5.00006C6 4.44778 6.44772 4.00006 7 4.00006C7.55228 4.00006 8 4.44778 8 5.00006V7.00006C8 7.55235 7.55228 8.00006 7 8.00006C6.44772 8.00006 6 7.55235 6 7.00006V5.00006ZM6 10.0001C6 9.44778 6.44772 9.00006 7 9.00006C7.55228 9.00006 8 9.44778 8 10.0001C8 10.5523 7.55228 11.0001 7 11.0001C6.44772 11.0001 6 10.5523 6 10.0001Z"
          fill="#F2C94C"
        />
      </svg>
    </WarningIconContainer>
  );
};

export default WarningIcon;
