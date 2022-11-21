import React, { PropsWithChildren } from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import { Navigate } from 'react-router-dom';

/**
 * @description
 * basic idea that you can not choose a wrong url, that is why you are safe, but when
 * the user tries to manipulate some url to get the the desired result and the BE returns 404
 * it will be propagated to this component and redirected
 * */
const SuspenseQueryComponent: React.FC<PropsWithChildren<unknown>> = ({
  children,
}) => {
  return (
    <ErrorBoundary fallback={<Navigate to="/404" />}>{children}</ErrorBoundary>
  );
};

export default SuspenseQueryComponent;
