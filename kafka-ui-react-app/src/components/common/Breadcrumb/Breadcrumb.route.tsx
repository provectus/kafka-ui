import React, { useContext, useEffect } from 'react';
import { Params, Location, useLocation, useParams } from 'react-router-dom';

import { BreadcrumbContext } from './Breadcrumb.context';

const getRoutePath = (location: Location, params: Params): string => {
  const { pathname } = location;

  if (!Object.keys(params).length) {
    return pathname; // we don't need to replace anything
  }

  let path = pathname;
  Object.entries(params).forEach(([paramName, paramValue]) => {
    if (paramValue) {
      path = path.replace(paramValue, `:${paramName}`);
    }
  });
  return path;
};

const BreadcrumbRouteInternal: React.FC = () => {
  const location = useLocation();
  const params = useParams();
  const path = getRoutePath(location, params);
  const context = useContext(BreadcrumbContext);

  useEffect(() => {
    context.handleRouteChange({
      url: location.pathname,
      path,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname]);

  return null;
};

interface BreadcrumbRoutProps {
  children: React.ReactNode;
}

export const BreadcrumbRoute: React.FC<BreadcrumbRoutProps> = ({
  children,
}) => {
  return (
    <>
      {children}
      <BreadcrumbRouteInternal />
    </>
  );
};
