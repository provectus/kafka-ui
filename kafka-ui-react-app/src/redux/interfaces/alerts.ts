import { ErrorResponse } from 'generated-sources';
import React from 'react';

export interface ServerResponse {
  status: number;
  statusText: string;
  body: ErrorResponse;
}

export interface FailurePayload {
  title: string;
  message?: string;
  subject: string;
  subjectId?: string | number;
  response?: ServerResponse;
}

export interface Alert {
  id: string;
  type: 'error' | 'success' | 'warning' | 'info';
  title: string;
  message: React.ReactNode;
  response?: ServerResponse;
  createdAt: number;
}

export type Alerts = Alert[];

export type AlertsState = Record<Alert['id'], Alert>;
