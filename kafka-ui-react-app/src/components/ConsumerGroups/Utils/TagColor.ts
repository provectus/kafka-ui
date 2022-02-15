import { ConsumerGroupState, ConsumerGroup } from 'generated-sources';

const getTagColor = (consumerGroup: ConsumerGroup) => {
  const { state = '' } = consumerGroup;
  switch (state) {
    case ConsumerGroupState.STABLE:
      return 'green';
    case ConsumerGroupState.DEAD:
      return 'red';
    case ConsumerGroupState.EMPTY:
      return 'white';
    default:
      return 'yellow';
  }
};
export default getTagColor;
