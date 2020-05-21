import React, { CSSProperties } from 'react';
import { Cluster } from 'redux/interfaces';
import { NavLink } from 'react-router-dom';
import {
  clusterBrokersPath,
  clusterTopicsPath,
  clusterConsumerGroupsPath,
} from 'lib/paths';

interface Props {
  cluster: Cluster;
}

const DefaultIcon: React.FC = () => {
  const style: CSSProperties = {
    width: '.6rem',
    left: '-8px',
    top: '-4px',
    position: 'relative',
  };

  return (
    <span title="Default Cluster" className="icon has-text-primary is-small">
      <i
        style={style}
        data-fa-transform="rotate-340"
        className="fas fa-thumbtack"
      />
    </span>
  );
};

const ClusterMenu: React.FC<Props> = ({ cluster }) => (
  <ul className="menu-list">
    <li>
      <NavLink
        exact
        to={clusterBrokersPath(cluster.name)}
        title={cluster.name}
        className="has-text-overflow-ellipsis"
      >
        {cluster.defaultCluster && <DefaultIcon />}
        {cluster.name}
      </NavLink>
      <ul>
        <NavLink
          to={clusterBrokersPath(cluster.name)}
          activeClassName="is-active"
          title="Brokers"
        >
          Brokers
        </NavLink>
        <NavLink
          to={clusterTopicsPath(cluster.name)}
          activeClassName="is-active"
          title="Topics"
        >
          Topics
        </NavLink>
        <NavLink
          to={clusterConsumerGroupsPath(cluster.name)}
          activeClassName="is-active"
          title="Consumers"
        >
          Consumers
        </NavLink>
      </ul>
    </li>
  </ul>
);

export default ClusterMenu;
