import React from 'react';
import { Cluster } from 'redux/interfaces';
import { NavLink } from 'react-router-dom';
import cx from 'classnames';
import ClusterMenu from './ClusterMenu';

interface Props {
  isClusterListFetched: boolean,
  clusters: Cluster[];
  className?: string;
}

const Nav: React.FC<Props> = ({
  isClusterListFetched,
  clusters,
  className,
}) => (
  <aside className={cx('menu has-shadow has-background-white', className)}>
    <p className="menu-label">
      General
    </p>
    <ul className="menu-list">
      <li>
        <NavLink exact to="/" activeClassName="is-active" title="Dashboard">
          Dashboard
        </NavLink>
      </li>
    </ul>
    <p className="menu-label">
      Clusters
    </p>
    {!isClusterListFetched && <div className="loader" />}

    {isClusterListFetched && clusters.map((cluster, index) => <ClusterMenu {...cluster} key={`cluster-list-item-key-${index}`}/>)}
  </aside>
);

export default Nav;
