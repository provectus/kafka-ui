import { ErrorResponse } from 'generated-sources';
import React from 'react';

export interface ServerResponse {
  status: number;
  statusText: string;
  url?: string;
  message?: ErrorResponse['message'];
}

export interface FailurePayload {
  title: string;
  message?: string;
  subject: string;
  response?: ServerResponse;
}

export type AlertType = 'error' | 'success' | 'warning' | 'info';

export interface Alert {
  id: string;
  type: AlertType;
  title: string;
  message: React.ReactNode;
  response?: ServerResponse;
  createdAt: number;
}

export type Alerts = Alert[];

export type AlertsState = Record<Alert['id'], Alert>;
