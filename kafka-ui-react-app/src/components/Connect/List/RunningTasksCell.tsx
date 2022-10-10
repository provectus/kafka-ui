import React from 'react';
import { FullConnectorInfo } from 'generated-sources';
import { CellContext } from '@tanstack/react-table';

const RunningTasksCell: React.FC<CellContext<FullConnectorInfo, unknown>> = ({
  row,
}) => {
  const { tasksCount, failedTasksCount } = row.original;

  if (!tasksCount) {
    return null;
  }

  return (
    <>
      {tasksCount - (failedTasksCount || 0)} of {tasksCount}
    </>
  );
};

export default RunningTasksCell;
