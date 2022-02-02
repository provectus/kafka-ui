import React from 'react';
import { dismissAlert } from 'redux/actions';
import { getAlerts } from 'redux/reducers/alerts/selectors';
import { alertDissmissed, selectAll } from 'redux/reducers/alerts/alertsSlice';
import { useAppSelector, useAppDispatch } from 'lib/hooks/redux';
import Alert from 'components/Alerts/Alert';

const Alerts: React.FC = () => {
  const alerts = useAppSelector(selectAll);
  const dispatch = useAppDispatch();
  const dismiss = React.useCallback((id: string) => {
    dispatch(alertDissmissed(id));
  }, []);

  const legacyAlerts = useAppSelector(getAlerts);
  const dismissLegacy = React.useCallback((id: string) => {
    dispatch(dismissAlert(id));
  }, []);

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
      {legacyAlerts.map(({ id, type, title, message }) => (
        <Alert
          key={id}
          type={type}
          title={title}
          message={message}
          onDissmiss={() => dismissLegacy(id)}
        />
      ))}
    </>
  );
};

export default Alerts;
