import { CellContext } from '@tanstack/react-table';
import React from 'react';

import * as S from './Table.styled';

const ExpanderCell: React.FC<CellContext<unknown, unknown>> = ({ row }) => {
  return (
    <S.ExpaderButton
      width="16"
      height="20"
      viewBox="0 -2 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      role="button"
      aria-label="Expand row"
      $disabled={!row.getCanExpand()}
      getIsExpanded={row.getIsExpanded()}
    >
      {row.getIsExpanded() ? (
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M14 16C15.1046 16 16 15.1046 16 14L16 2C16 0.895431 15.1046 -7.8281e-08 14 -1.74846e-07L2 -1.22392e-06C0.895432 -1.32048e-06 1.32048e-06 0.895429 1.22392e-06 2L1.74846e-07 14C7.8281e-08 15.1046 0.895431 16 2 16L14 16ZM5 7C4.44772 7 4 7.44771 4 8C4 8.55228 4.44772 9 5 9L11 9C11.5523 9 12 8.55228 12 8C12 7.44772 11.5523 7 11 7L5 7Z"
        />
      ) : (
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M0 2C0 0.895431 0.895431 0 2 0H14C15.1046 0 16 0.895431 16 2V14C16 15.1046 15.1046 16 14 16H2C0.895431 16 0 15.1046 0 14V2ZM8 4C8.55229 4 9 4.44772 9 5V7H11C11.5523 7 12 7.44772 12 8C12 8.55229 11.5523 9 11 9H9V11C9 11.5523 8.55229 12 8 12C7.44772 12 7 11.5523 7 11V9H5C4.44772 9 4 8.55228 4 8C4 7.44771 4.44772 7 5 7H7V5C7 4.44772 7.44772 4 8 4Z"
        />
      )}
    </S.ExpaderButton>
  );
};

export default ExpanderCell;
