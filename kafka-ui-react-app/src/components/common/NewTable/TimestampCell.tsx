import { CellContext } from '@tanstack/react-table';
import dayjs from 'dayjs';
import React from 'react';

import * as S from './Table.styled';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const TimestapmCell: React.FC<CellContext<any, any>> = ({ getValue }) => (
  <S.Nowrap>{dayjs(getValue()).format('MM.DD.YY hh:mm:ss a')}</S.Nowrap>
);

export default TimestapmCell;
