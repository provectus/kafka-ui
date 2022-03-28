import React from 'react';
import { useSelector } from 'react-redux';
import { Switch, Redirect, useParams } from 'react-router-dom';
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
          <BreadcrumbRoute
            path={clusterBrokersPath(':clusterName')}
            component={Brokers}
          />
          <BreadcrumbRoute
            path={clusterTopicsPath(':clusterName')}
            component={Topics}
          />
          <BreadcrumbRoute
            path={clusterConsumerGroupsPath(':clusterName')}
            component={ConsumersGroups}
          />
          {hasSchemaRegistryConfigured && (
            <BreadcrumbRoute
              path={clusterSchemasPath(':clusterName')}
              component={Schemas}
            />
          )}
          {hasKafkaConnectConfigured && (
            <BreadcrumbRoute
              path={clusterConnectsPath(':clusterName')}
              component={Connect}
            />
          )}
          {hasKafkaConnectConfigured && (
            <BreadcrumbRoute
              path={clusterConnectorsPath(':clusterName')}
              component={Connect}
            />
          )}
          {hasKsqlDbConfigured && (
            <BreadcrumbRoute
              path={clusterKsqlDbPath(':clusterName')}
              component={KsqlDb}
            />
          )}
          <Redirect
            from="/ui/clusters/:clusterName"
            to="/ui/clusters/:clusterName/brokers"
          />
        </Switch>
      </ClusterContext.Provider>
    </BreadcrumbProvider>
  );
};

export default Cluster;
