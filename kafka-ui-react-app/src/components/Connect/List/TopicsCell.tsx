import React from 'react';
import { FullConnectorInfo } from 'generated-sources';
import { CellContext } from '@tanstack/react-table';
import { Link } from 'react-router-dom';
import { Tag } from 'components/common/Tag/Tag.styled';
import { ClusterNameRoute, clusterTopicPath } from 'lib/paths';
import useAppParams from 'lib/hooks/useAppParams';

import * as S from './List.styled';

const TopicsCell: React.FC<CellContext<FullConnectorInfo, unknown>> = ({
  row,
}) => {
  const { topics } = row.original;

  const { clusterName } = useAppParams<ClusterNameRoute>();
  return (
    <S.TagsWrapper>
      {topics?.map((t) => (
        <Tag key={t} color="gray">
          <Link color="#4C4CFF" to={clusterTopicPath(clusterName, t)}>
            {t}
          </Link>
        </Tag>
      ))}
    </S.TagsWrapper>
  );
};

export default TopicsCell;
