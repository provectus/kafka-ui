import React, { useContext, useEffect } from 'react';
import {
  Route,
  RouteProps,
  useLocation,
  useRouteMatch,
} from 'react-router-dom';

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

export const BreadcrumbRoute: React.FC<RouteProps> = ({
  children,
  render,
  component,
  ...props
}) => {
  return (
    <Route
      {...props}
      render={(routeParams) => {
        if (component) {
          return (
            <>
              {React.createElement(component)}
              <BreadcrumbRouteInternal />
            </>
          );
        }
        if (render) {
          return (
            <>
              {render(routeParams)}
              <BreadcrumbRouteInternal />
            </>
          );
        }

        return (
          <>
            {children}
            <BreadcrumbRouteInternal />
          </>
        );
      }}
    />
  );
};
