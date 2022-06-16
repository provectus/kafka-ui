import { createContext } from 'react';

export interface BreadcrumbEntry {
  link: string;
  path: string[];
}

interface BreadcrumbContextInterface extends BreadcrumbEntry {
  handleRouteChange: (match: { url: string; path: string }) => void;
}

export const BreadcrumbContext = createContext<BreadcrumbContextInterface>({
  link: '',
  path: [],
  handleRouteChange: () => {},
});
