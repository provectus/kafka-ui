import React, { useContext, useEffect } from 'react';
import { useLocation, useRouteMatch } from 'react-router-dom';

import { BreadcrumbContext } from './Breadcrumb.context';

const BreadcrumbRouteInternal: React.FC = () => {
  const match = useRouteMatch();
  const location = useLocation();
  const context = useContext(BreadcrumbContext);

  useEffect(() => {
    context.handleRouteChange({ ...match, url: location.pathname });
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
