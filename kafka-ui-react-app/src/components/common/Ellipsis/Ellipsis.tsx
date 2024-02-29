import React, { PropsWithChildren } from 'react';

import * as S from './Ellipsis.styled';

type EllipsisProps = {
  text: React.ReactNode;
  style?: React.CSSProperties;
};

const Ellipsis: React.FC<PropsWithChildren<EllipsisProps>> = ({
  text,
  style,
  children,
}) => {
  return (
    <S.Wrapper>
      <S.Text style={style}>{text}</S.Text>
      {children}
    </S.Wrapper>
  );
};
export default Ellipsis;
