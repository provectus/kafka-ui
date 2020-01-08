import React, { CSSProperties } from 'react';
import { Cluster } from 'types';
import { NavLink } from 'react-router-dom';

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
      <NavLink exact to={`/clusters/${id}/brokers`} title={name} className="has-text-overflow-ellipsis">
        {defaultCluster && <DefaultIcon />}
        {name}
      </NavLink>
      <ul>
        <NavLink to={`/clusters/${id}/brokers`} activeClassName="is-active" title="Brokers">
          Brokers
        </NavLink>
        <NavLink to={`/clusters/${id}/topics`} activeClassName="is-active" title="Topics">
          Topics
        </NavLink>
      </ul>
    </li>
  </ul>
);

export default ClusterMenu;
