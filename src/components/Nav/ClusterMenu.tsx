import React, { CSSProperties } from 'react';
import { Cluster } from 'redux/interfaces';
import { NavLink } from 'react-router-dom';
import { clusterBrokersPath, clusterTopicsPath } from 'lib/paths';

interface Props extends Cluster {}

const DefaultIcon: React.FC = () => {
  const style: CSSProperties = {
    width: '.6rem',
    left: '-8px',
    top: '-4px',
    position: 'relative',
  };

  return (
    <span title="Default Cluster" className="icon has-text-primary is-small">
      <i style={style} data-fa-transform="rotate-340" className="fas fa-thumbtack" />
    </span>
  )
};

const ClusterMenu: React.FC<Props> = ({
  id,
  name,
  defaultCluster,
}) => (
  <ul className="menu-list">
    <li>
      <NavLink exact to={clusterBrokersPath(id)} title={name} className="has-text-overflow-ellipsis">
        {defaultCluster && <DefaultIcon />}
        {name}
      </NavLink>
      <ul>
        <NavLink to={clusterBrokersPath(id)} activeClassName="is-active" title="Brokers">
          Brokers
        </NavLink>
        <NavLink to={clusterTopicsPath(id)} activeClassName="is-active" title="Topics">
          Topics
        </NavLink>
      </ul>
    </li>
  </ul>
);

export default ClusterMenu;
