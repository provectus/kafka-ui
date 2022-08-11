import { CellContext } from '@tanstack/react-table';
import React from 'react';
import IndeterminateCheckbox from 'components/common/IndeterminateCheckbox/IndeterminateCheckbox';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const SelectRowCell: React.FC<CellContext<any, unknown>> = ({ row }) => (
  <IndeterminateCheckbox
    checked={row.getIsSelected()}
    disabled={!row.getCanSelect()}
    indeterminate={row.getIsSomeSelected()}
    onChange={row.getToggleSelectedHandler()}
  />
);

export default SelectRowCell;
