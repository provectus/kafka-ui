import { CellContext } from '@tanstack/react-table';
import React from 'react';

import * as S from './Table.styled';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const TruncatedTextCell: React.FC<CellContext<any, unknown>> = ({
  getValue,
}) => <S.Ellipsis>{getValue<string>()}</S.Ellipsis>;

export default TruncatedTextCell;
