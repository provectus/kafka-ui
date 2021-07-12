import React from 'react';
import { useHistory } from 'react-router-dom';
import { ConsumerGroup } from 'generated-sources';
import ConsumerGroupStateTag from 'components/common/ConsumerGroupState/ConsumerGroupStateTag';

const ListItem: React.FC<{ consumerGroup: ConsumerGroup }> = ({
  consumerGroup,
}) => {
  const history = useHistory();

  function goToConsumerGroupDetails() {
    history.push(`consumer-groups/${consumerGroup.groupId}`);
  }

  return (
    <tr className="is-clickable" onClick={goToConsumerGroupDetails}>
      <td>{consumerGroup.groupId}</td>
      <td>{consumerGroup.members}</td>
      <td>{consumerGroup.topics}</td>
      <td>{consumerGroup.messagesBehind}</td>
      <td>{consumerGroup.coordinator?.id}</td>
      <td>
        <ConsumerGroupStateTag state={consumerGroup.state} />
      </td>
    </tr>
  );
};

export default ListItem;
