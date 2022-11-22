import React from 'react';
import { Button } from 'components/common/Button/Button';

import * as S from './ErrorPage.styled';

const ErrorPage = () => {
  return (
    <S.Wrapper>
      <S.Number>404</S.Number>
      <S.Text>Page is not found</S.Text>
      <Button buttonType="primary" buttonSize="M" to="/">
        Go Back to Dashboard
      </Button>
    </S.Wrapper>
  );
};

export default ErrorPage;
