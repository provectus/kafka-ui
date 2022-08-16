import { ConnectorTaskStatus, Task } from 'generated-sources';

export default function getTaskMetrics(tasks?: Task[]) {
  const initialMetrics = {
    running: 0,
    failed: 0,
  };

  if (!tasks) {
    return initialMetrics;
  }

  return tasks.reduce((acc, { status }) => {
    const state = status?.state;
    if (state === ConnectorTaskStatus.RUNNING) {
      return { ...acc, running: acc.running + 1 };
    }
    if (state === ConnectorTaskStatus.FAILED) {
      return { ...acc, failed: acc.failed + 1 };
    }
    return acc;
  }, initialMetrics);
}
