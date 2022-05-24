import React from 'react';
import { useSelector } from 'react-redux';
import { Switch, Redirect, useParams, Route } from 'react-router-dom';
import { ClusterFeaturesEnum } from 'generated-sources';
import {
  getClustersFeatures,
  getClustersReadonlyStatus,
} from 'redux/reducers/clusters/clustersSlice';
import {
  clusterBrokersPath,
  clusterConnectorsPath,
  clusterConnectsPath,
  clusterConsumerGroupsPath,
  clusterKsqlDbPath,
  clusterPath,
  clusterSchemasPath,
  clusterTopicsPath,
} from 'lib/paths';
import Topics from 'components/Topics/Topics';
import Schemas from 'components/Schemas/Schemas';
import Connect from 'components/Connect/Connect';
import ClusterContext from 'components/contexts/ClusterContext';
import Brokers from 'components/Brokers/Brokers';
import ConsumersGroups from 'components/ConsumerGroups/ConsumerGroups';
import KsqlDb from 'components/KsqlDb/KsqlDb';
import Breadcrumb from 'components/common/Breadcrumb/Breadcrumb';
import { BreadcrumbRoute } from 'components/common/Breadcrumb/Breadcrumb.route';
import { BreadcrumbProvider } from 'components/common/Breadcrumb/Breadcrumb.provider';

const Cluster: React.FC = () => {
  const { clusterName } = useParams<{ clusterName: string }>();
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
      <ClusterContext.Provider value={contextValue}>
        <Switch>
          <Route path={clusterBrokersPath()}>
            <BreadcrumbRoute>
              <Brokers />
            </BreadcrumbRoute>
          </Route>
          <Route path={clusterTopicsPath()}>
            <BreadcrumbRoute>
              <Topics />
            </BreadcrumbRoute>
          </Route>
          <Route path={clusterConsumerGroupsPath()}>
            <BreadcrumbRoute>
              <ConsumersGroups />
            </BreadcrumbRoute>
          </Route>
          {hasSchemaRegistryConfigured && (
            <Route path={clusterSchemasPath()}>
              <BreadcrumbRoute>
                <Schemas />
              </BreadcrumbRoute>
            </Route>
          )}
          {hasKafkaConnectConfigured && (
            <Route path={clusterConnectsPath()}>
              <BreadcrumbRoute>
                <Connect />
              </BreadcrumbRoute>
            </Route>
          )}
          {hasKafkaConnectConfigured && (
            <Route path={clusterConnectorsPath()}>
              <BreadcrumbRoute>
                <Connect />
              </BreadcrumbRoute>
            </Route>
          )}
          {hasKsqlDbConfigured && (
            <Route path={clusterKsqlDbPath()}>
              <BreadcrumbRoute>
                <KsqlDb />
              </BreadcrumbRoute>
            </Route>
          )}
          <Route path={clusterPath()}>
            <Redirect to="/ui/clusters/:clusterName/brokers" />
          </Route>
        </Switch>
      </ClusterContext.Provider>
    </BreadcrumbProvider>
  );
};

export default Cluster;
