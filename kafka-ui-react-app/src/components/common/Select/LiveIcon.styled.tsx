import styled from 'styled-components';
import React from 'react';

interface Props {
  className?: string;
  selectSize: 'M' | 'L';
}

const LiveIcon: React.FC<Props> = ({ className }) => {
  return (
    <i className={className}>
      <svg
        width="16"
        height="16"
        viewBox="0 0 16 16"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <circle cx="8" cy="8" r="7" fill="#FAD1D1" />
        <circle cx="8" cy="8" r="4" fill="#E61A1A" />
      </svg>
    </i>
  );
};

export default styled(LiveIcon)`
  position: absolute;
  left: 12px;
  top: ${(props) => (props.selectSize === 'M' ? '8px' : '12px')};
`;
