import { ErrorResponse } from 'generated-sources';

export interface ServerResponse {
  status: number;
  statusText: string;
  url?: string;
  message?: ErrorResponse['message'];
}

export type AlertType = 'error' | 'success' | 'warning' | 'info';

export interface Alert {
  id: string;
  type: AlertType;
  title: string;
  message: string;
  response?: ServerResponse;
  createdAt: number;
}

export type Alerts = Alert[];

export type AlertsState = Record<Alert['id'], Alert>;
