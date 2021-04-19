import React from 'react';
import { useHistory } from 'react-router-dom';
import { ConsumerGroup } from 'generated-sources';

const ListItem: React.FC<{ consumerGroup: ConsumerGroup }> = ({
  consumerGroup,
}) => {
  const history = useHistory();

  function goToConsumerGroupDetails() {
    history.push(`consumer-groups/${consumerGroup.consumerGroupId}`);
  }

  return (
    <tr className="is-clickable" onClick={goToConsumerGroupDetails}>
      <td>{consumerGroup.consumerGroupId}</td>
      <td>{consumerGroup.numConsumers}</td>
      <td>{consumerGroup.numTopics}</td>
    </tr>
  );
};

export default ListItem;
