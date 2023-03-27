import React from 'react';
import * as SP from 'components/common/Spinner/Spinner.styled';

import * as S from './PageLoader.styled';

const PageLoader: React.FC = () => (
  <S.Wrapper>
    <SP.Spinner
      role="progressbar"
      width={80}
      height={80}
      borderWidth={10}
      emptyBorderColor={false}
    />
  </S.Wrapper>
);

export default PageLoader;
