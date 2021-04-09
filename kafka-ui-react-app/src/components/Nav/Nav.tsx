import React from 'react';
import { NavLink } from 'react-router-dom';
import cx from 'classnames';
import { Cluster } from 'generated-sources';
import ClusterMenu from './ClusterMenu';

interface Props {
  isClusterListFetched?: boolean;
  clusters: Cluster[];
  className?: string;
}

const Nav: React.FC<Props> = ({
  isClusterListFetched,
  clusters,
  className,
}) => (
  <aside className={cx('menu has-shadow has-background-white', className)}>
    <p className="menu-label">General</p>
    <ul className="menu-list">
      <li>
        <NavLink exact to="/ui" activeClassName="is-active" title="Dashboard">
          Dashboard
        </NavLink>
      </li>
    </ul>
    <p className="menu-label">Clusters</p>
    {!isClusterListFetched && <div className="loader" />}

    {isClusterListFetched &&
      clusters.map((cluster) => (
        <ClusterMenu cluster={cluster} key={cluster.name} />
      ))}
  </aside>
);

export default Nav;
