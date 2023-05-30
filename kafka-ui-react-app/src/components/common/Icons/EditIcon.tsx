import React from 'react';
import styled, { useTheme } from 'styled-components';

const EditIcon: React.FC<{ className?: string }> = ({ className }) => {
  const theme = useTheme();
  return (
    <svg
      width="13"
      height="14"
      viewBox="0 0 13 14"
      className={className}
      fill={theme.icons.editIcon.normal}
      xmlns="http://www.w3.org/2000/svg"
      aria-labelledby="title"
    >
      <title>Edit</title>
      <path d="M9.53697 1.15916C10.0914 0.60473 10.9886 0.602975 11.5408 1.15524L12.5408 2.15518C13.093 2.70745 13.0913 3.60461 12.5368 4.15904L10.3564 6.33944L7.35657 3.33956L9.53697 1.15916Z" />
      <path d="M6.64946 4.04667L9.53674e-07 10.6961L0 13.696L2.99988 13.696L9.64934 7.04655L6.64946 4.04667Z" />
    </svg>
  );
};

export default styled(EditIcon)``;
