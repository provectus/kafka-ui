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

import ClusterMenuItem from './ClusterMenuItem/ClusterMenuItem';
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
          <ClusterMenuItem
            liType="primary"
            to={clusterBrokersPath(name)}
            activeClassName="is-active"
            title="Brokers"
          />
          <ClusterMenuItem
            liType="primary"
            to={clusterTopicsPath(name)}
            activeClassName="is-active"
            title="Topics"
          />
          <ClusterMenuItem
            liType="primary"
            to={clusterConsumerGroupsPath(name)}
            activeClassName="is-active"
            title="Consumers"
          />

          {hasFeatureConfigured(ClusterFeaturesEnum.SCHEMA_REGISTRY) && (
            <ClusterMenuItem
              liType="primary"
              to={clusterSchemasPath(name)}
              activeClassName="is-active"
              title="Schema Registry"
            />
          )}
          {hasFeatureConfigured(ClusterFeaturesEnum.KAFKA_CONNECT) && (
            <ClusterMenuItem
              liType="primary"
              to={clusterConnectorsPath(name)}
              activeClassName="is-active"
              title="Kafka Connect"
              isActive={(_, location) =>
                location.pathname.startsWith(clusterConnectsPath(name)) ||
                location.pathname.startsWith(clusterConnectorsPath(name))
              }
            />
          )}
          {hasFeatureConfigured(ClusterFeaturesEnum.KSQL_DB) && (
            <ClusterMenuItem
              liType="primary"
              to={clusterKsqlDbPath(name)}
              activeClassName="is-active"
              title="KSQL DB"
            />
          )}
        </ul>
      </li>
    </ul>
  );
};

export default ClusterMenu;
