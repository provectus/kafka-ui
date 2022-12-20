import React, { Suspense } from 'react';
import { Routes, Navigate, Route, Outlet } from 'react-router-dom';
import useAppParams from 'lib/hooks/useAppParams';
import { ClusterFeaturesEnum } from 'generated-sources';
import {
  clusterBrokerRelativePath,
  clusterConnectorsRelativePath,
  clusterConnectsRelativePath,
  clusterConsumerGroupsRelativePath,
  clusterKsqlDbRelativePath,
  ClusterNameRoute,
  clusterSchemasRelativePath,
  clusterTopicsRelativePath,
  getNonExactPath,
} from 'lib/paths';
import ClusterContext from 'components/contexts/ClusterContext';
import PageLoader from 'components/common/PageLoader/PageLoader';
import { useClusters } from 'lib/hooks/api/clusters';

// We can't use Lazy loading till we have a better way to update publicPath in runtime
// Now java app replaces paths in builded index.html file.
const Brokers = React.lazy(() => import('components/Brokers/Brokers'));
const Topics = React.lazy(() => import('components/Topics/Topics'));
const Schemas = React.lazy(() => import('components/Schemas/Schemas'));
const Connect = React.lazy(() => import('components/Connect/Connect'));
const KsqlDb = React.lazy(() => import('components/KsqlDb/KsqlDb'));
const ConsumerGroups = React.lazy(
  () => import('components/ConsumerGroups/ConsumerGroups')
);

const Cluster: React.FC = () => {
  const { clusterName } = useAppParams<ClusterNameRoute>();
  const { data } = useClusters();
  const contextValue = React.useMemo(() => {
    const cluster = data?.find(({ name }) => name === clusterName);
    const features = cluster?.features || [];

    return {
      isReadOnly: cluster?.readOnly || false,
      hasKafkaConnectConfigured: features.includes(
        ClusterFeaturesEnum.KAFKA_CONNECT
      ),
      hasSchemaRegistryConfigured: features.includes(
        ClusterFeaturesEnum.SCHEMA_REGISTRY
      ),
      isTopicDeletionAllowed: features.includes(
        ClusterFeaturesEnum.TOPIC_DELETION
      ),
      hasKsqlDbConfigured: features.includes(ClusterFeaturesEnum.KSQL_DB),
    };
  }, [clusterName, data]);

  return (
    <Suspense fallback={<PageLoader />}>
      <ClusterContext.Provider value={contextValue}>
        <Suspense fallback={<PageLoader />}>
          <Routes>
            <Route
              path={getNonExactPath(clusterBrokerRelativePath)}
              element={<Brokers />}
            />
            <Route
              path={getNonExactPath(clusterTopicsRelativePath)}
              element={<Topics />}
            />
            <Route
              path={getNonExactPath(clusterConsumerGroupsRelativePath)}
              element={<ConsumerGroups />}
            />
            {contextValue.hasSchemaRegistryConfigured && (
              <Route
                path={getNonExactPath(clusterSchemasRelativePath)}
                element={<Schemas />}
              />
            )}
            {contextValue.hasKafkaConnectConfigured && (
              <Route
                path={getNonExactPath(clusterConnectsRelativePath)}
                element={<Connect />}
              />
            )}
            {contextValue.hasKafkaConnectConfigured && (
              <Route
                path={getNonExactPath(clusterConnectorsRelativePath)}
                element={<Connect />}
              />
            )}
            {contextValue.hasKsqlDbConfigured && (
              <Route
                path={getNonExactPath(clusterKsqlDbRelativePath)}
                element={<KsqlDb />}
              />
            )}
            <Route
              path="/"
              element={<Navigate to={clusterBrokerRelativePath} replace />}
            />
          </Routes>
          <Outlet />
        </Suspense>
      </ClusterContext.Provider>
    </Suspense>
  );
};

export default Cluster;
