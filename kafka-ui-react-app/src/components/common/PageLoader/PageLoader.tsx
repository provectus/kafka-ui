import React from 'react';
import Spinner from 'components/common/Spinner/Spinner';

import * as S from './PageLoader.styled';

const PageLoader: React.FC = () => (
  <S.Wrapper>
    <Spinner />
  </S.Wrapper>
);

export default PageLoader;
