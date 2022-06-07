import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import { clusterPath } from 'lib/paths';
import { BREADCRUMB_DEFINITIONS } from 'lib/constants';

import { BreadcrumbWrapper } from './Breadcrumb.styled';
import { BreadcrumbContext } from './Breadcrumb.context';

const basePathEntriesLength = clusterPath().split('/').length;

export interface BreadcrumbDefinitions {
  [key: string]: string;
}

const Breadcrumb: React.FC = () => {
  const breadcrumbContext = useContext(BreadcrumbContext);

  const links = React.useMemo(
    () => breadcrumbContext.path.slice(basePathEntriesLength),
    [breadcrumbContext.path]
  );

  const getPathPredicate = (index: number) =>
    `${breadcrumbContext.link
      .split('/')
      .slice(0, basePathEntriesLength + index + 1)
      .join('/')}`;

  if (links.length < 2) {
    return null;
  }

  return (
    <BreadcrumbWrapper role="list">
      {links.slice(0, links.length - 1).map((link, index) => (
        <li key={link}>
          <Link to={getPathPredicate(index)}>
            {BREADCRUMB_DEFINITIONS[link] || link}
          </Link>
        </li>
      ))}
      <li>
        <span>{links[links.length - 1]}</span>
      </li>
    </BreadcrumbWrapper>
  );
};

export default Breadcrumb;
