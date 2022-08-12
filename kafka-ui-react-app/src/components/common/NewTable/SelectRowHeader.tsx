import { HeaderContext } from '@tanstack/react-table';
import React from 'react';
import IndeterminateCheckbox from 'components/common/IndeterminateCheckbox/IndeterminateCheckbox';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const SelectRowHeader: React.FC<HeaderContext<any, unknown>> = ({ table }) => (
  <IndeterminateCheckbox
    checked={table.getIsAllPageRowsSelected()}
    indeterminate={table.getIsSomePageRowsSelected()}
    onChange={table.getToggleAllPageRowsSelectedHandler()}
  />
);

export default SelectRowHeader;
