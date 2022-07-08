import React from 'react';
import { TopicWithDetailedInfo } from 'redux/interfaces';
import { TableCellProps } from 'components/common/SmartTable/TableColumn';
import { Tag } from 'components/common/Tag/Tag.styled';
import BytesFormatted from 'components/common/BytesFormatted/BytesFormatted';

import * as S from './List.styled';

export const TitleCell: React.FC<
  TableCellProps<TopicWithDetailedInfo, string>
> = ({ dataItem: { internal, name } }) => {
  return (
    <>
      {internal && <Tag color="gray">IN</Tag>}
      <S.Link to={name} $isInternal={internal}>
        {name}
      </S.Link>
    </>
  );
};

export const TopicSizeCell: React.FC<
  TableCellProps<TopicWithDetailedInfo, string>
> = ({ dataItem: { segmentSize } }) => {
  return <BytesFormatted value={segmentSize} />;
};

export const OutOfSyncReplicasCell: React.FC<
  TableCellProps<TopicWithDetailedInfo, string>
> = ({ dataItem: { partitions } }) => {
  const data = React.useMemo(() => {
    if (partitions === undefined || partitions.length === 0) {
      return 0;
    }

    return partitions.reduce((memo, { replicas }) => {
      const outOfSync = replicas?.filter(({ inSync }) => !inSync);
      return memo + (outOfSync?.length || 0);
    }, 0);
  }, [partitions]);

  return <span>{data}</span>;
};

export const MessagesCell: React.FC<
  TableCellProps<TopicWithDetailedInfo, string>
> = ({ dataItem: { partitions } }) => {
  const data = React.useMemo(() => {
    if (partitions === undefined || partitions.length === 0) {
      return 0;
    }

    return partitions.reduce((memo, { offsetMax, offsetMin }) => {
      return memo + (offsetMax - offsetMin);
    }, 0);
  }, [partitions]);

  return <span>{data}</span>;
};
