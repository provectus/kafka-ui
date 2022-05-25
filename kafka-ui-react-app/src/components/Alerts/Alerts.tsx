import React from 'react';
import { alertDissmissed, selectAll } from 'redux/reducers/alerts/alertsSlice';
import { useAppSelector, useAppDispatch } from 'lib/hooks/redux';
import Alert from 'components/Alerts/Alert';

const Alerts: React.FC = () => {
  const alerts = useAppSelector(selectAll);
  const dispatch = useAppDispatch();
  const dismiss = React.useCallback(
    (id: string) => {
      dispatch(alertDissmissed(id));
    },
    [dispatch]
  );

  return (
    <>
      {alerts.map(({ id, type, title, message }) => (
        <Alert
          key={id}
          type={type}
          title={title}
          message={message}
          onDissmiss={() => dismiss(id)}
        />
      ))}
    </>
  );
};

export default Alerts;
