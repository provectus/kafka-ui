import React from 'react';
import { Link } from 'react-router-dom';
import { ConsumerGroup, ConsumerGroupState } from 'generated-sources';
import { Tag } from 'components/common/Tag/Tag.styled';
import { TableKeyLink } from 'components/common/table/Table/TableKeyLink.styled';

const ListItem: React.FC<{ consumerGroup: ConsumerGroup }> = ({
  consumerGroup,
}) => {
  const stateColor = React.useMemo(() => {
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
  }, [consumerGroup]);

  return (
    <tr>
      <TableKeyLink>
        <Link to={`consumer-groups/${consumerGroup.groupId}`}>
          {consumerGroup.groupId}
        </Link>
      </TableKeyLink>
      <td>{consumerGroup.members}</td>
      <td>{consumerGroup.topics}</td>
      <td>{consumerGroup.messagesBehind}</td>
      <td>{consumerGroup.coordinator?.id}</td>
      <td>
        <Tag color={stateColor}>{consumerGroup.state}</Tag>
      </td>
    </tr>
  );
};

export default ListItem;
