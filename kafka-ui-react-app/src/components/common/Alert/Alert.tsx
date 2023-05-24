import React from 'react';
import CloseCircleIcon from 'components/common/Icons/CloseCircleIcon';
import IconButtonWrapper from 'components/common/Icons/IconButtonWrapper';
import { ToastTypes } from 'lib/errorHandling';

import * as S from './Alert.styled';

export interface AlertProps {
  title: string;
  type: ToastTypes;
  message: React.ReactNode;
  onDissmiss(): void;
}

const Alert: React.FC<AlertProps> = ({ title, type, message, onDissmiss }) => (
  <S.Alert $type={type} role="alert">
    <div>
      <S.Title role="heading">{title}</S.Title>
      <S.Message role="contentinfo">{message}</S.Message>
    </div>
    <IconButtonWrapper role="button" onClick={onDissmiss}>
      <CloseCircleIcon />
    </IconButtonWrapper>
  </S.Alert>
);

export default Alert;
