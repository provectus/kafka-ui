import React from 'react';
import styled, { useTheme } from 'styled-components';

const CloseIcon: React.FC<{ className?: string }> = ({ className }) => {
  const theme = useTheme();
  return (
    <svg
      width="10"
      height="10"
      viewBox="0 0 10 10"
      className={className}
      fill={theme.icons.closeIcon.normal}
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M0.646447 0.646447C0.841709 0.451184 1.15829 0.451184 1.35355 0.646447L5 4.29289L8.64645 0.646447C8.84171 0.451184 9.15829 0.451184 9.35355 0.646447C9.54882 0.841709 9.54882 1.15829 9.35355 1.35355L5.70711 5L9.35355 8.64645C9.54882 8.84171 9.54882 9.15829 9.35355 9.35355C9.15829 9.54882 8.84171 9.54882 8.64645 9.35355L5 5.70711L1.35355 9.35355C1.15829 9.54881 0.841709 9.54881 0.646447 9.35355C0.451185 9.15829 0.451185 8.84171 0.646447 8.64645L4.29289 5L0.646447 1.35355C0.451184 1.15829 0.451184 0.841709 0.646447 0.646447Z"
      />
    </svg>
  );
};

export default styled(CloseIcon)``;
