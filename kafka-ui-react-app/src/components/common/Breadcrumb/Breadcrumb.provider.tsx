import React, { PropsWithChildren, useState } from 'react';
import capitalize from 'lodash/capitalize';

import { BreadcrumbContext, BreadcrumbEntry } from './Breadcrumb.context';

const mapLocationToPath = (
  splittedLocation: string[],
  splittedRoutePath: string[]
) =>
  splittedLocation.map((item, index) =>
    splittedRoutePath[index]?.charAt(0) !== ':'
      ? item.split('-').map(capitalize).join(' ')
      : item
  );

export const BreadcrumbProvider: React.FC<PropsWithChildren<unknown>> = ({
  children,
}) => {
  const [state, setState] = useState<BreadcrumbEntry>({
    link: '',
    path: [],
  });

  const handleRouteChange = (params: { url: string; path: string }) => {
    setState((prevState) => {
      const newState = { ...prevState };
      const splittedRoutePath = params.path.split('/');
      const splittedLocation = params.url.split('/');

      if (prevState.link !== params.url) {
        newState.link = params.url;
        newState.path = mapLocationToPath(splittedLocation, splittedRoutePath);
      }

      if (prevState.path.length < params.path.split('/').length) {
        newState.path = mapLocationToPath(splittedLocation, splittedRoutePath);
      }

      return newState;
    });
  };

  return (
    <BreadcrumbContext.Provider
      value={{
        ...state,
        handleRouteChange,
      }}
    >
      {children}
    </BreadcrumbContext.Provider>
  );
};
