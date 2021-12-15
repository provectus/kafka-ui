import React from 'react';
import CloseIcon from 'components/common/Icons/CloseIcon';
import IconButtonWrapper from 'components/common/Icons/IconButtonWrapper';
import { Alert as AlertType } from 'redux/interfaces';

import * as S from './Alert.styled';

export interface AlertProps {
  title: AlertType['title'];
  type: AlertType['type'];
  message: AlertType['message'];
  onDissmiss(): void;
}

const Alert: React.FC<AlertProps> = ({ title, type, message, onDissmiss }) => (
  <S.Alert $type={type} role="alert">
    <div>
      <S.Title role="heading">{title}</S.Title>
      <S.Message role="contentinfo">{message}</S.Message>
    </div>

    <IconButtonWrapper role="button" onClick={onDissmiss}>
      <CloseIcon />
    </IconButtonWrapper>
  </S.Alert>
);

export default Alert;
