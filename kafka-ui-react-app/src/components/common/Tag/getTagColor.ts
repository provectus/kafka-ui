import {
  ConnectorState,
  ConnectorStatus,
  ConsumerGroup,
  ConsumerGroupState,
  TaskStatus,
} from 'generated-sources';

const getTagColor = ({
  state,
}: ConnectorStatus | TaskStatus | ConsumerGroup) => {
  switch (state) {
    case ConnectorState.RUNNING:
    case ConsumerGroupState.STABLE:
      return 'green';
    case ConnectorState.FAILED:
    case ConnectorState.TASK_FAILED:
    case ConsumerGroupState.DEAD:
      return 'red';
    case ConsumerGroupState.EMPTY:
      return 'white';
    default:
      return 'yellow';
  }
};

export default getTagColor;
