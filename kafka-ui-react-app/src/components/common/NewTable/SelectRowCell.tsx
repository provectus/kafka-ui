import { CellContext } from '@tanstack/react-table';
import React from 'react';
import IndeterminateCheckbox from 'components/common/IndeterminateCheckbox/IndeterminateCheckbox';

const SelectRowCell: React.FC<CellContext<unknown, unknown>> = ({ row }) => (
  <IndeterminateCheckbox
    checked={row.getIsSelected()}
    disabled={!row.getCanSelect()}
    indeterminate={row.getIsSomeSelected()}
    onChange={row.getToggleSelectedHandler()}
  />
);

export default SelectRowCell;
