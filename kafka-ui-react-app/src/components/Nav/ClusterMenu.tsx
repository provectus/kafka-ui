import React from 'react';
import { Cluster, ClusterFeaturesEnum } from 'generated-sources';
import { NavLink } from 'react-router-dom';
import {
  clusterBrokersPath,
  clusterTopicsPath,
  clusterConsumerGroupsPath,
  clusterSchemasPath,
  clusterConnectorsPath,
  clusterConnectsPath,
  clusterKsqlDbPath,
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
          {defaultCluster && <DefaultClusterIcon />}
          {name}
          <ClusterStatusIcon status={status} />
        </NavLink>
        <ul>
          <li>
            <NavLink
              to={clusterBrokersPath(name)}
              activeClassName="is-active"
              title="Brokers"
            >
              Brokers
            </NavLink>
          </li>
          <li>
            <NavLink
              to={clusterTopicsPath(name)}
              activeClassName="is-active"
              title="Topics"
            >
              Topics
            </NavLink>
          </li>
          <li>
            <NavLink
              to={clusterConsumerGroupsPath(name)}
              activeClassName="is-active"
              title="Consumers"
            >
              Consumers
            </NavLink>
          </li>

          {hasFeatureConfigured(ClusterFeaturesEnum.SCHEMA_REGISTRY) && (
            <li>
              <NavLink
                to={clusterSchemasPath(name)}
                activeClassName="is-active"
                title="Schema Registry"
              >
                Schema Registry
              </NavLink>
            </li>
          )}
          {hasFeatureConfigured(ClusterFeaturesEnum.KAFKA_CONNECT) && (
            <li>
              <NavLink
                to={clusterConnectorsPath(name)}
                activeClassName="is-active"
                title="Kafka Connect"
                isActive={(_, location) =>
                  location.pathname.startsWith(clusterConnectsPath(name)) ||
                  location.pathname.startsWith(clusterConnectorsPath(name))
                }
              >
                Kafka Connect
              </NavLink>
            </li>
          )}
          {hasFeatureConfigured(ClusterFeaturesEnum.KSQL_DB) && (
            <li>
              <NavLink
                to={clusterKsqlDbPath(name)}
                activeClassName="is-active"
                title="KSQL DB"
              >
                KSQL DB
              </NavLink>
            </li>
          )}
        </ul>
      </li>
    </ul>
  );
};

export default ClusterMenu;
