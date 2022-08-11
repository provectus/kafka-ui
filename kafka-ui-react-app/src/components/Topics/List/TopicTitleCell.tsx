import React from 'react';
import { CellContext } from '@tanstack/react-table';
import { Tag } from 'components/common/Tag/Tag.styled';
import { Topic } from 'generated-sources';

import * as S from './List.styled';

export const TopicTitleCell: React.FC<CellContext<Topic, unknown>> = ({
  row: { original },
  getValue,
}) => {
  const name = getValue() as string;
  const { internal } = original;
  return (
    <S.TitleCellContent title={name}>
      {original.internal && <Tag color="gray">IN</Tag>}
      <S.Link to={name} $isInternal={internal}>
        {name}
      </S.Link>
    </S.TitleCellContent>
  );
};
