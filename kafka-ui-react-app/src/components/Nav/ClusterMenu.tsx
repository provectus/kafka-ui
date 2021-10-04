import React from 'react';
import { Cluster, ClusterFeaturesEnum } from 'generated-sources';
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
import ClusterTab from './ClusterMenuItem/ClusterTab/ClusterTab';
import ClusterMenuList from './ClusterMenuList/ClusterMenuList.styled';

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
  const [isOpen, setisOpen] = React.useState(true);
  return (
    <ClusterMenuList>
      <hr />
      <ClusterTab
        title={name}
        status={status}
        defaultCluster={defaultCluster}
        isOpen={isOpen}
        toggleClusterMenu={() => setisOpen((prev) => !prev)}
      />
      {isOpen && (
        <ul>
          <ClusterMenuItem
            to={clusterBrokersPath(name)}
            activeClassName="is-active"
            title="Brokers"
          />
          <ClusterMenuItem
            to={clusterTopicsPath(name)}
            activeClassName="is-active"
            title="Topics"
          />
          <ClusterMenuItem
            to={clusterConsumerGroupsPath(name)}
            activeClassName="is-active"
            title="Consumers"
          />

          {hasFeatureConfigured(ClusterFeaturesEnum.SCHEMA_REGISTRY) && (
            <ClusterMenuItem
              to={clusterSchemasPath(name)}
              activeClassName="is-active"
              title="Schema Registry"
            />
          )}
          {hasFeatureConfigured(ClusterFeaturesEnum.KAFKA_CONNECT) && (
            <ClusterMenuItem
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
              to={clusterKsqlDbPath(name)}
              activeClassName="is-active"
              title="KSQL DB"
            />
          )}
        </ul>
      )}
    </ClusterMenuList>
  );
};

export default ClusterMenu;
