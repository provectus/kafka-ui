import React, { useContext, useEffect } from 'react';
import { useLocation } from 'react-router-dom';

import { BreadcrumbContext } from './Breadcrumb.context';

const BreadcrumbRouteInternal: React.FC = () => {
  const location = useLocation();
  const context = useContext(BreadcrumbContext);

  useEffect(() => {
    // TODO check this
    context.handleRouteChange({
      url: location.pathname,
      path: location.pathname,
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
