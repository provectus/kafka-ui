import React from 'react';
import Alert from 'components/common/Alert/Alert';
import toast, { ToastType } from 'react-hot-toast';
import { ErrorResponse } from 'generated-sources';

interface ServerResponse {
  status: number;
  statusText: string;
  url?: string;
  message?: ErrorResponse['message'];
}

export const getResponse = async (
  response: Response
): Promise<ServerResponse> => {
  let body;
  try {
    body = await response.json();
  } catch (e) {
    // do nothing;
  }
  return {
    status: response.status,
    statusText: response.statusText,
    url: response.url,
    message: body?.message,
  };
};

interface AlertOptions {
  id?: string;
  title?: string;
  message: React.ReactNode;
}

export const showAlert = (
  type: ToastType,
  { title, message, id }: AlertOptions
) => {
  toast.custom(
    (t) => (
      <Alert
        title={title || ''}
        type={type}
        message={message}
        onDissmiss={() => toast.remove(t.id)}
      />
    ),
    { id }
  );
};

export const showSuccessAlert = (options: AlertOptions) => {
  showAlert('success', {
    ...options,
    title: options.title || 'Success',
  });
};

export const showServerError = async (
  response: Response,
  options?: AlertOptions
) => {
  let body: Record<string, string> = {};
  try {
    body = await response.json();
  } catch (e) {
    // do nothing;
  }
  if (response.status) {
    showAlert('error', {
      id: response.url,
      title: `${response.status} ${response.statusText}`,
      message: body?.message || 'An error occurred',
      ...options,
    });
  }
};
