import React from 'react';
import { FullConnectorInfo } from 'generated-sources';
import { CellContext } from '@tanstack/react-table';
import { useNavigate } from 'react-router-dom';
import { Tag } from 'components/common/Tag/Tag.styled';
import { ClusterNameRoute, clusterTopicPath } from 'lib/paths';
import useAppParams from 'lib/hooks/useAppParams';

import * as S from './List.styled';

const TopicsCell: React.FC<CellContext<FullConnectorInfo, unknown>> = ({
  row,
}) => {
  const { topics } = row.original;
  const { clusterName } = useAppParams<ClusterNameRoute>();
  const navigate = useNavigate();

  const navigateToTopic = (
    e: React.KeyboardEvent | React.MouseEvent,
    topic: string
  ) => {
    e.preventDefault();
    e.stopPropagation();
    navigate(clusterTopicPath(clusterName, topic));
  };

  return (
    <S.TagsWrapper>
      {topics?.map((t) => (
        <Tag key={t} color="green">
          <span
            role="link"
            onClick={(e) => navigateToTopic(e, t)}
            onKeyDown={(e) => navigateToTopic(e, t)}
            tabIndex={0}
          >
            {t}
          </span>
        </Tag>
      ))}
    </S.TagsWrapper>
  );
};

export default TopicsCell;
