import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import cn from 'classnames';
import { clusterPath } from 'lib/paths';

import { BreadcrumbWrapper } from './Breadcrumb.styled';
import { BreadcrumbContext } from './Breadcrumb.context';

const basePathEntriesLength = clusterPath(':clusterName').split('/').length;

const Breadcrumb: React.FC = () => {
  const breadcrumbContext = useContext(BreadcrumbContext);

  const links = React.useMemo(
    () => breadcrumbContext.path.slice(basePathEntriesLength),
    [breadcrumbContext.path]
  );

  const getPathPredicate = React.useCallback(
    (index: number) =>
      `${breadcrumbContext.link
        .split('/')
        .slice(0, basePathEntriesLength + index + 1)
        .join('/')}`,
    [breadcrumbContext.link]
  );

  if (links.length < 2) {
    return null;
  }

  return (
    <BreadcrumbWrapper role="list">
      {links.slice(0, links.length - 1).map((link, index) => (
        <li key={link}>
          <Link to={getPathPredicate(index)}>{link}</Link>
        </li>
      ))}
      <li
        className={cn('is-active', {
          'is-size-4 has-text-weight-medium is-capitalized': links.length < 2,
        })}
      >
        <span>{links[links.length - 1]}</span>
      </li>
    </BreadcrumbWrapper>
  );
};

export default Breadcrumb;
