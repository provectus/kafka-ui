import { createSelector } from 'reselect';
import { RootState, AlertsState } from 'redux/interfaces';
import { orderBy } from 'lodash';

const alertsState = ({ alerts }: RootState): AlertsState => alerts;

export const getAlerts = createSelector(alertsState, (alerts) =>
  orderBy(Object.values(alerts), 'createdAt', 'desc')
);
