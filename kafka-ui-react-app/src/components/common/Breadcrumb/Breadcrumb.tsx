import React from 'react';
import { Link, useLocation, useParams } from 'react-router-dom';
import cn from 'classnames';
import { clusterPath } from 'lib/paths';
import { capitalize } from 'lodash';

export interface BreadcrumbItem {
  label: string;
  href: string;
}

interface Props {
  links?: BreadcrumbItem[];
}

const basePathEntriesLength = clusterPath(':clusterName').split('/').length;

const Breadcrumb: React.FC<Props> = () => {
  const location = useLocation();
  const params = useParams();
  const pathParams = React.useMemo(() => Object.values(params), [params]);

  const paths = location.pathname.split('/');
  const links = React.useMemo(
    () =>
      paths.slice(basePathEntriesLength).map((path, index) => {
        return !pathParams.includes(paths[basePathEntriesLength + index])
          ? path.split('-').map(capitalize).join(' ')
          : path;
      }),
    [paths]
  );
  const currentLink = React.useMemo(() => {
    if (paths.length < basePathEntriesLength) {
      return 'Dashboard';
    }
    return links[links.length - 1];
  }, [links]);

  const getPathPredicate = React.useCallback(
    (index: number) =>
      `${paths.slice(0, basePathEntriesLength + index + 1).join('/')}`,
    [paths]
  );

  return (
    <nav className="breadcrumb mb-2 pt-2" aria-label="breadcrumbs">
      <ul className={cn('py-3', 'px-4', { 'py-3': !links.length })}>
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
          <span>{currentLink}</span>
        </li>
      </ul>
    </nav>
  );
};

export default Breadcrumb;
