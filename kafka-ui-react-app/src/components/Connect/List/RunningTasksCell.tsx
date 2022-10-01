import React from 'react';
import { FullConnectorInfo } from 'generated-sources';
import { CellContext } from '@tanstack/react-table';

const RunningTasksCell: React.FC<CellContext<FullConnectorInfo, unknown>> = ({
  row,
}) => {
  const { tasksCount, failedTasksCount } = row.original;

  const runningTasks = React.useMemo(() => {
    if (!tasksCount) return null;
    return tasksCount - (failedTasksCount || 0);
  }, [tasksCount, failedTasksCount]);

  if (!tasksCount) {
    return null;
  }

  return (
    <span>
      {runningTasks} of {tasksCount}
    </span>
  );
};

export default RunningTasksCell;
