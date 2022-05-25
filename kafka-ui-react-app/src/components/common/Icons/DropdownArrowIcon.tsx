import React from 'react';

interface Props {
  isOpen: boolean;
}

const DropdownArrowIcon: React.FC<Props> = ({ isOpen }) => (
  <svg
    width="24"
    height="24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    color="#aaa"
    transform={isOpen ? 'rotate(180)' : ''}
  >
    <path d="M6 9L12 15 18 9" />
  </svg>
);

export default DropdownArrowIcon;
