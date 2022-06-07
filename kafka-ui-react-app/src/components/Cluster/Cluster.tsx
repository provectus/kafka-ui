import React, { Suspense } from 'react';
import { useSelector } from 'react-redux';
import { Routes, Navigate, Route, Outlet } from 'react-router-dom';
import useAppParams from 'lib/hooks/useAppParams';
import { ClusterFeaturesEnum } from 'generated-sources';
import {
  getClustersFeatures,
  getClustersReadonlyStatus,
} from 'redux/reducers/clusters/clustersSlice';
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
import Topics from 'components/Topics/Topics';
import Schemas from 'components/Schemas/Schemas';
import Connect from 'components/Connect/Connect';
import ClusterContext from 'components/contexts/ClusterContext';
import ConsumersGroups from 'components/ConsumerGroups/ConsumerGroups';
import KsqlDb from 'components/KsqlDb/KsqlDb';
import Breadcrumb from 'components/common/Breadcrumb/Breadcrumb';
import { BreadcrumbRoute } from 'components/common/Breadcrumb/Breadcrumb.route';
import { BreadcrumbProvider } from 'components/common/Breadcrumb/Breadcrumb.provider';
import PageLoader from 'components/common/PageLoader/PageLoader';

const Brokers = React.lazy(() => import('components/Brokers/Brokers'));

const Cluster: React.FC = () => {
  const { clusterName } = useAppParams<ClusterNameRoute>();
  const isReadOnly = useSelector(getClustersReadonlyStatus(clusterName));
  const features = useSelector(getClustersFeatures(clusterName));

  const hasKafkaConnectConfigured = features.includes(
    ClusterFeaturesEnum.KAFKA_CONNECT
  );
  const hasSchemaRegistryConfigured = features.includes(
    ClusterFeaturesEnum.SCHEMA_REGISTRY
  );
  const isTopicDeletionAllowed = features.includes(
    ClusterFeaturesEnum.TOPIC_DELETION
  );
  const hasKsqlDbConfigured = features.includes(ClusterFeaturesEnum.KSQL_DB);

  const contextValue = React.useMemo(
    () => ({
      isReadOnly,
      hasKafkaConnectConfigured,
      hasSchemaRegistryConfigured,
      isTopicDeletionAllowed,
    }),
    [
      hasKafkaConnectConfigured,
      hasSchemaRegistryConfigured,
      isReadOnly,
      isTopicDeletionAllowed,
    ]
  );

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
                  <ConsumersGroups />
                </BreadcrumbRoute>
              }
            />
            {hasSchemaRegistryConfigured && (
              <Route
                path={getNonExactPath(clusterSchemasRelativePath)}
                element={
                  <BreadcrumbRoute>
                    <Schemas />
                  </BreadcrumbRoute>
                }
              />
            )}
            {hasKafkaConnectConfigured && (
              <Route
                path={getNonExactPath(clusterConnectsRelativePath)}
                element={
                  <BreadcrumbRoute>
                    <Connect />
                  </BreadcrumbRoute>
                }
              />
            )}
            {hasKafkaConnectConfigured && (
              <Route
                path={getNonExactPath(clusterConnectorsRelativePath)}
                element={
                  <BreadcrumbRoute>
                    <Connect />
                  </BreadcrumbRoute>
                }
              />
            )}
            {hasKsqlDbConfigured && (
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
