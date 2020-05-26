import React from 'react';
import { useHistory } from 'react-router-dom';
import { ConsumerGroup } from 'redux/interfaces';

const ListItem: React.FC<{ consumerGroup: ConsumerGroup }> = ({
  consumerGroup,
}) => {
  const history = useHistory();

  function goToConsumerGroupDetails() {
    history.push(`consumer-groups/${consumerGroup.consumerGroupId}`);
  }

  return (
    <tr className="cursor-pointer" onClick={goToConsumerGroupDetails}>
      <td>{consumerGroup.consumerGroupId}</td>
      <td>{consumerGroup.numConsumers}</td>
      <td>{consumerGroup.numTopics}</td>
    </tr>
  );
};

export default ListItem;
