import { CellContext } from '@tanstack/react-table';
import { formatTimestamp } from 'lib/dateTimeHelpers';
import React from 'react';

import * as S from './Table.styled';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const TimestampCell: React.FC<CellContext<any, unknown>> = ({ getValue }) => (
  <S.Nowrap>{formatTimestamp(getValue<string | number>())}</S.Nowrap>
);

export default TimestampCell;
