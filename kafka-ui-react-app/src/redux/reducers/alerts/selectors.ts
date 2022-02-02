import { createSelector } from '@reduxjs/toolkit';
import { RootState, AlertsState } from 'redux/interfaces';
import { orderBy } from 'lodash';

const alertsState = ({ legacyAlerts }: RootState): AlertsState => legacyAlerts;

export const getAlerts = createSelector(alertsState, (alerts) =>
  orderBy(Object.values(alerts), 'createdAt', 'desc')
);
