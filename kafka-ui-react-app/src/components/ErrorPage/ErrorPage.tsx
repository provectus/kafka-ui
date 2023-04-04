import React from 'react';
import { Button } from 'components/common/Button/Button';

import * as S from './ErrorPage.styled';

interface Props {
  status?: number;
  text?: string;
  btnText?: string;
}

const ErrorPage: React.FC<Props> = ({
  status = 404,
  text = 'Page is not found',
  btnText = 'Go Back to Dashboard',
}) => {
  return (
    <S.Wrapper>
      <S.Status>{status}</S.Status>
      <S.Text>{text}</S.Text>
      <Button buttonType="primary" buttonSize="M" to="/">
        {btnText}
      </Button>
    </S.Wrapper>
  );
};

export default ErrorPage;
