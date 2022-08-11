import { CellContext } from '@tanstack/react-table';
import React from 'react';
import { SelectRowCell } from 'components/common/NewTable';
import { Topic } from 'generated-sources';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const SelectTopicCell: React.FC<CellContext<Topic, unknown>> = (props) => {
  const {
    row: { original },
  } = props;
  if (original.internal) {
    return null;
  }
  return <SelectRowCell {...props} />;
};

export default SelectTopicCell;
