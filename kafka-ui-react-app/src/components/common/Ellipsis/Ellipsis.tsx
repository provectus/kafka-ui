import React, { PropsWithChildren } from 'react';

import * as S from './Ellipsis.styled';

type EllipsisProps = {
  text: React.ReactNode;
};

const Ellipsis: React.FC<PropsWithChildren<EllipsisProps>> = ({
  text,
  children,
}) => {
  return (
    <S.Wrapper>
      <S.Text>{text}</S.Text>
      {children}
    </S.Wrapper>
  );
};
export default Ellipsis;
