import React from 'react';

interface Props {
  isOpen: boolean;
}

const ClusterTabChevron: React.FC<Props> = ({ isOpen }) => {
  return (
    <svg
      className="cluster-tab-chevron"
      width="10"
      height="6"
      viewBox="0 0 10 6"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d={isOpen ? 'M8.99988 5L4.99988 1L0.999878 5' : 'M1 1L5 5L9 1'}
        stroke="#73848C"
      />
    </svg>
  );
};

export default ClusterTabChevron;
