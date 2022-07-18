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
import Breadcrumb from 'components/common/Breadcrumb/Breadcrumb';
import { BreadcrumbRoute } from 'components/common/Breadcrumb/Breadcrumb.route';
import { BreadcrumbProvider } from 'components/common/Breadcrumb/Breadcrumb.provider';
import PageLoader from 'components/common/PageLoader/PageLoader';
import { useClusters } from 'lib/hooks/api/clusters';

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
    <BreadcrumbProvider>
      <Breadcrumb />
      <Suspense fallback={<PageLoader />}>
        <ClusterContext.Provider value={contextValue}>
          <Routes>
            <Route
              path={getNonExactPath(clusterBrokerRelativePath)}
              element={
                <BreadcrumbRoute>
                  <Brokers />
                </BreadcrumbRoute>
              }
            />
            <Route
              path={getNonExactPath(clusterTopicsRelativePath)}
              element={
                <BreadcrumbRoute>
                  <Topics />
                </BreadcrumbRoute>
              }
            />
            <Route
              path={getNonExactPath(clusterConsumerGroupsRelativePath)}
              element={
                <BreadcrumbRoute>
                  <ConsumerGroups />
                </BreadcrumbRoute>
              }
            />
            {contextValue.hasSchemaRegistryConfigured && (
              <Route
                path={getNonExactPath(clusterSchemasRelativePath)}
                element={
                  <BreadcrumbRoute>
                    <Schemas />
                  </BreadcrumbRoute>
                }
              />
            )}
            {contextValue.hasKafkaConnectConfigured && (
              <Route
                path={getNonExactPath(clusterConnectsRelativePath)}
                element={
                  <BreadcrumbRoute>
                    <Connect />
                  </BreadcrumbRoute>
                }
              />
            )}
            {contextValue.hasKafkaConnectConfigured && (
              <Route
                path={getNonExactPath(clusterConnectorsRelativePath)}
                element={
                  <BreadcrumbRoute>
                    <Connect />
                  </BreadcrumbRoute>
                }
              />
            )}
            {contextValue.hasKsqlDbConfigured && (
              <Route
                path={getNonExactPath(clusterKsqlDbRelativePath)}
                element={
                  <BreadcrumbRoute>
                    <KsqlDb />
                  </BreadcrumbRoute>
                }
              />
            )}
            <Route
              path="/"
              element={<Navigate to={clusterBrokerRelativePath} replace />}
            />
          </Routes>
          <Outlet />
        </ClusterContext.Provider>
      </Suspense>
    </BreadcrumbProvider>
  );
};

export default Cluster;
