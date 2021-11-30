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

import ClusterMenuItem from './ClusterMenuItem';
import ClusterTab from './ClusterTab/ClusterTab';
import * as S from './Nav.styled';

interface Props {
  cluster: Cluster;
}

const ClusterMenu: React.FC<Props> = ({
  cluster: { name, status, features },
}) => {
  const hasFeatureConfigured = React.useCallback(
    (key) => features?.includes(key),
    [features]
  );
  const [isOpen, setIsOpen] = React.useState(false);
  return (
    <S.List>
      <S.Divider />
      <ClusterTab
        title={name}
        status={status}
        isOpen={isOpen}
        toggleClusterMenu={() => setIsOpen((prev) => !prev)}
      />
      {isOpen && (
        <S.List>
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
        </S.List>
      )}
    </S.List>
  );
};

export default ClusterMenu;
