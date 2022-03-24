import React from 'react';
import { Link } from 'react-router-dom';
import { Tag } from 'components/common/Tag/Tag.styled';
import { TableCellProps } from 'components/common/SmartTable/TableColumn';
import getTagColor from 'components/ConsumerGroups/Utils/TagColor';
import { ConsumerGroup } from 'generated-sources';
import { SmartTableKeyLink } from 'components/common/table/Table/TableKeyLink.styled';

export const StatusCell: React.FC<TableCellProps<ConsumerGroup, string>> = ({
  dataItem,
}) => {
  return <Tag color={getTagColor(dataItem)}>{dataItem.state}</Tag>;
};

export const GroupIDCell: React.FC<TableCellProps<ConsumerGroup, string>> = ({
  dataItem: { groupId },
}) => {
  return (
    <SmartTableKeyLink>
      <Link to={`consumer-groups/${groupId}`}>{groupId}</Link>
    </SmartTableKeyLink>
  );
};
