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
  singleMode?: boolean;
}

const ClusterMenu: React.FC<Props> = ({
  cluster: { name, status, features },
  singleMode,
}) => {
  const hasFeatureConfigured = React.useCallback(
    (key: ClusterFeaturesEnum) => features?.includes(key),
    [features]
  );
  const [isOpen, setIsOpen] = React.useState(!!singleMode);
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
          <ClusterMenuItem to={clusterBrokersPath(name)} title="Brokers" />
          <ClusterMenuItem to={clusterTopicsPath(name)} title="Topics" />
          <ClusterMenuItem
            to={clusterConsumerGroupsPath(name)}
            title="Consumers"
          />

          {hasFeatureConfigured(ClusterFeaturesEnum.SCHEMA_REGISTRY) && (
            <ClusterMenuItem
              to={clusterSchemasPath(name)}
              title="Schema Registry"
            />
          )}
          {hasFeatureConfigured(ClusterFeaturesEnum.KAFKA_CONNECT) && (
            <ClusterMenuItem
              to={clusterConnectorsPath(name)}
              title="Kafka Connect"
              isActive={(_, location) =>
                location.pathname.startsWith(clusterConnectsPath(name)) ||
                location.pathname.startsWith(clusterConnectorsPath(name))
              }
            />
          )}
          {hasFeatureConfigured(ClusterFeaturesEnum.KSQL_DB) && (
            <ClusterMenuItem to={clusterKsqlDbPath(name)} title="KSQL DB" />
          )}
        </S.List>
      )}
    </S.List>
  );
};

export default ClusterMenu;
