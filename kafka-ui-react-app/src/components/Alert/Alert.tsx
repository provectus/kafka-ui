import React from 'react';
import cx from 'classnames';
import { useDispatch } from 'react-redux';
import { dismissAlert } from 'redux/actions';
import { Alert as AlertProps } from 'redux/interfaces';

const Alert: React.FC<AlertProps> = ({
  id,
  type,
  title,
  message,
  response,
}) => {
  const classNames = React.useMemo(
    () =>
      cx('notification', {
        'is-danger': type === 'error',
        'is-success': type === 'success',
        'is-info': type === 'info',
        'is-warning': type === 'warning',
      }),
    [type]
  );
  const dispatch = useDispatch();
  const dismiss = React.useCallback(() => {
    dispatch(dismissAlert(id));
  }, []);

  return (
    <div className={classNames}>
      <button className="delete" type="button" onClick={dismiss}>
        x
      </button>
      <div>
        <h6 className="title is-6">{title}</h6>
        <p className="subtitle is-6">{message}</p>
        {response && (
          <div className="is-flex">
            <div className="mr-3">{response.status}</div>
            <div>{response.body?.message || response.statusText}</div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Alert;
