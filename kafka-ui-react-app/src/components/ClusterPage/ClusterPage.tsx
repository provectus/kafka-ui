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
  clusterConfigRelativePath,
  getNonExactPath,
  clusterAclRelativePath,
} from 'lib/paths';
import ClusterContext from 'components/contexts/ClusterContext';
import PageLoader from 'components/common/PageLoader/PageLoader';
import { useClusters } from 'lib/hooks/api/clusters';
import { GlobalSettingsContext } from 'components/contexts/GlobalSettingsContext';

const Brokers = React.lazy(() => import('components/Brokers/Brokers'));
const Topics = React.lazy(() => import('components/Topics/Topics'));
const Schemas = React.lazy(() => import('components/Schemas/Schemas'));
const Connect = React.lazy(() => import('components/Connect/Connect'));
const KsqlDb = React.lazy(() => import('components/KsqlDb/KsqlDb'));
const ClusterConfigPage = React.lazy(
  () => import('components/ClusterPage/ClusterConfigPage')
);
const ConsumerGroups = React.lazy(
  () => import('components/ConsumerGroups/ConsumerGroups')
);
const AclPage = React.lazy(() => import('components/ACLPage/ACLPage'));

const ClusterPage: React.FC = () => {
  const { clusterName } = useAppParams<ClusterNameRoute>();
  const appInfo = React.useContext(GlobalSettingsContext);

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
      hasAclViewConfigured:
        features.includes(ClusterFeaturesEnum.KAFKA_ACL_VIEW) ||
        features.includes(ClusterFeaturesEnum.KAFKA_ACL_EDIT),
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
            {contextValue.hasAclViewConfigured && (
              <Route
                path={getNonExactPath(clusterAclRelativePath)}
                element={<AclPage />}
              />
            )}
            {appInfo.hasDynamicConfig && (
              <Route
                path={getNonExactPath(clusterConfigRelativePath)}
                element={<ClusterConfigPage />}
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

export default ClusterPage;
