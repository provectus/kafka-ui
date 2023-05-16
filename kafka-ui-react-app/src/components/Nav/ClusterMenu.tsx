import React from 'react';
import { Cluster, ClusterFeaturesEnum } from 'generated-sources';
import {
  clusterBrokersPath,
  clusterTopicsPath,
  clusterConsumerGroupsPath,
  clusterSchemasPath,
  clusterConnectorsPath,
  clusterKsqlDbPath,
  clusterACLPath,
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
  const hasFeatureConfigured = (key: ClusterFeaturesEnum) =>
    features?.includes(key);
  const [isOpen, setIsOpen] = React.useState(!!singleMode);
  return (
    <S.List>
      <hr />
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
            />
          )}
          {hasFeatureConfigured(ClusterFeaturesEnum.KSQL_DB) && (
            <ClusterMenuItem to={clusterKsqlDbPath(name)} title="KSQL DB" />
          )}
          {(hasFeatureConfigured(ClusterFeaturesEnum.KAFKA_ACL_VIEW) ||
            hasFeatureConfigured(ClusterFeaturesEnum.KAFKA_ACL_EDIT)) && (
            <ClusterMenuItem to={clusterACLPath(name)} title="ACL" />
          )}
        </S.List>
      )}
    </S.List>
  );
};

export default ClusterMenu;
