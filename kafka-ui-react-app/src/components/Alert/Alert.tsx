import React from 'react';
import { useDispatch } from 'react-redux';
import { dismissAlert } from 'redux/actions';
import { Alert as AlertProps } from 'redux/interfaces';
import CloseIcon from 'components/common/Icons/CloseIcon';
import IconButtonWrapper from 'components/common/Icons/IconButtonWrapper';

import * as S from './Alert.styled';

const Alert: React.FC<AlertProps> = ({
  id,
  type,
  title,
  message,
  response,
}) => {
  const dispatch = useDispatch();
  const dismiss = React.useCallback(() => {
    dispatch(dismissAlert(id));
  }, []);

  return (
    <S.Wrapper $type={type}>
      <div>
        <S.Title role="heading">{title}</S.Title>
        <S.Message role="contentinfo">{message}</S.Message>
        {response && (
          <S.Message role="contentinfo">
            {response.status} {response.body?.message || response.statusText}
          </S.Message>
        )}
      </div>

      <IconButtonWrapper role="button" onClick={dismiss}>
        <CloseIcon />
      </IconButtonWrapper>
    </S.Wrapper>
  );
};

export default Alert;
