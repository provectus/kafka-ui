import React, { PropsWithChildren } from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import { Navigate } from 'react-router-dom';

const ErrorComponent: React.FC<{ error: Error }> = ({ error }) => {
  const errorStatus = (error as unknown as Response)?.status
    ? (error as unknown as Response).status
    : '404';

  return <Navigate to={`/${errorStatus}`} />;
};

/**
 * @description
 * basic idea that you can not choose a wrong url, that is why you are safe, but when
 * the user tries to manipulate some url to get the the desired result and the BE returns 404
 * it will be propagated to this component and redirected
 *
 * !!NOTE!! But only use this Component for GET query Throw error cause maybe in the future inner functionality may change
 * */
const SuspenseQueryComponent: React.FC<PropsWithChildren<unknown>> = ({
  children,
}) => {
  return (
    <ErrorBoundary FallbackComponent={ErrorComponent}>{children}</ErrorBoundary>
  );
};

export default SuspenseQueryComponent;
