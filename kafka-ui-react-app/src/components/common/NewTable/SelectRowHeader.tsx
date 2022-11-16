import { HeaderContext } from '@tanstack/react-table';
import React from 'react';
import IndeterminateCheckbox from 'components/common/IndeterminateCheckbox/IndeterminateCheckbox';

const SelectRowHeader: React.FC<HeaderContext<unknown, unknown>> = ({
  table,
}) => (
  <IndeterminateCheckbox
    checked={table.getIsAllRowsSelected()}
    indeterminate={table.getIsSomePageRowsSelected()}
    onChange={table.getToggleAllPageRowsSelectedHandler()}
  />
);

export default SelectRowHeader;
