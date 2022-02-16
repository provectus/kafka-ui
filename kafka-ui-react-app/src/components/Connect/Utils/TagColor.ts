import { ConnectorState, ConnectorStatus, TaskStatus } from 'generated-sources';

const getTagColor = (status: ConnectorStatus | TaskStatus) => {
  const { state = '' } = status;

  switch (state) {
    case ConnectorState.RUNNING:
      return 'green';
    case ConnectorState.FAILED:
    case ConnectorState.TASK_FAILED:
      return 'red';
    default:
      return 'yellow';
  }
};

export default getTagColor;
