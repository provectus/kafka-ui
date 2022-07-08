import React from 'react';

import * as S from './PageLoader.styled';

const PageLoader: React.FC = () => (
  <S.Wrapper>
    <S.Spinner role="progressbar" />
  </S.Wrapper>
);

export default PageLoader;
