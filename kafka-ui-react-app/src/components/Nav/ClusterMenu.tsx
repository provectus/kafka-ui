import React from 'react';
import { Cluster, ClusterFeaturesEnum } from 'generated-sources';
import { NavLink } from 'react-router-dom';
import {
  clusterBrokersPath,
  clusterTopicsPath,
  clusterConsumerGroupsPath,
  clusterSchemasPath,
  clusterConnectorsPath,
} from 'lib/paths';
import DefaultClusterIcon from './DefaultClusterIcon';
import ClusterStatusIcon from './ClusterStatusIcon';

interface Props {
  cluster: Cluster;
}

const ClusterMenu: React.FC<Props> = ({
  cluster: { name, status, defaultCluster, features },
}) => {
  const hasFeatureConfigured = React.useCallback(
    (key) => features?.includes(key),
    [features]
  );
  return (
    <ul className="menu-list">
      <li>
        <NavLink
          exact
          to={clusterBrokersPath(name)}
          title={name}
          className="has-text-overflow-ellipsis"
        >
          {!defaultCluster && <DefaultClusterIcon />}
          {name}
          <ClusterStatusIcon status={status} />
        </NavLink>
        <ul>
          <NavLink
            to={clusterBrokersPath(name)}
            activeClassName="is-active"
            title="Brokers"
          >
            Brokers
          </NavLink>
          <NavLink
            to={clusterTopicsPath(name)}
            activeClassName="is-active"
            title="Topics"
          >
            Topics
          </NavLink>
          <NavLink
            to={clusterConsumerGroupsPath(name)}
            activeClassName="is-active"
            title="Consumers"
          >
            Consumers
          </NavLink>
          {hasFeatureConfigured(ClusterFeaturesEnum.SCHEMA_REGISTRY) && (
            <NavLink
              to={clusterSchemasPath(name)}
              activeClassName="is-active"
              title="Schema Registry"
            >
              Schema Registry
            </NavLink>
          )}
          {hasFeatureConfigured(ClusterFeaturesEnum.KAFKA_CONNECT) && (
            <NavLink
              to={clusterConnectorsPath(name)}
              activeClassName="is-active"
              title="Kafka Connect"
            >
              Kafka Connect
            </NavLink>
          )}
        </ul>
      </li>
    </ul>
  );
};

export default ClusterMenu;
