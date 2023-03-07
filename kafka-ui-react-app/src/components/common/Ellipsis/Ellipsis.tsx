import React, { ReactElement } from 'react';
import WarningRedIcon from 'components/common/Icons/WarningRedIcon';

import * as S from './Ellipsis.styled';

type PropsType = {
  serde?: string;
  children?: ReactElement | string | undefined;
};

const Ellipsis: React.FC<PropsType> = ({ serde, children }) => {
  return (
    <S.StyledDataCellFlex>
      <S.StyledIsLongText>{children}</S.StyledIsLongText>
      <S.Icon>{serde === 'Fallback' && <WarningRedIcon />}</S.Icon>
    </S.StyledDataCellFlex>
  );
};
export default Ellipsis;
