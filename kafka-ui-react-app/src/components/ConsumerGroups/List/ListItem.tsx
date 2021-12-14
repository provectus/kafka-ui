import React from 'react';
import { Link } from 'react-router-dom';
import { ConsumerGroup } from 'generated-sources';
import TagStyled from 'components/common/Tag/Tag.styled';
import { TableKeyLink } from 'components/common/table/Table/TableKeyLink.styled';

const ListItem: React.FC<{ consumerGroup: ConsumerGroup }> = ({
  consumerGroup,
}) => {
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
        <TagStyled color="yellow">{consumerGroup.state}</TagStyled>
      </td>
    </tr>
  );
};

export default ListItem;
