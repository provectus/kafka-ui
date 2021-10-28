import React from 'react';
import { useDispatch } from 'react-redux';
import { dismissAlert } from 'redux/actions';
import { Alert as AlertProps } from 'redux/interfaces';
import CloseIcon from 'components/common/Icons/CloseIcon';
import IconButtonWrapper from 'components/common/Icons/IconButtonWrapper';

import { AlertWrapper } from './Alert.styled';

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
    <AlertWrapper type={type}>
      <div>
        <div className="alert-title">{title}</div>
        <p className="alert-message">{message}</p>
        {response && (
          <p className="alert-message alert-server-response">
            {response.status} {response.body?.message || response.statusText}
          </p>
        )}
      </div>

      <IconButtonWrapper onClick={dismiss} aria-hidden>
        <CloseIcon />
      </IconButtonWrapper>
    </AlertWrapper>
  );
};

export default Alert;
