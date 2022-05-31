import React from 'react';
import { Link } from 'react-router-dom';
import { Tag } from 'components/common/Tag/Tag.styled';
import { TableCellProps } from 'components/common/SmartTable/TableColumn';
import { ConsumerGroup } from 'generated-sources';
import { SmartTableKeyLink } from 'components/common/table/Table/TableKeyLink.styled';
import getTagColor from 'components/common/Tag/getTagColor';

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
      <Link to={groupId}>{groupId}</Link>
    </SmartTableKeyLink>
  );
};
