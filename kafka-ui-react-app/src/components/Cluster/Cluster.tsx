import React from 'react';
import { useSelector } from 'react-redux';
import { Switch, Route, Redirect, useParams } from 'react-router-dom';
import { ClusterFeaturesEnum } from 'generated-sources';
import {
  getClustersFeatures,
  getClustersReadonlyStatus,
} from 'redux/reducers/clusters/selectors';
import {
  clusterBrokersPath,
  clusterConnectorsPath,
  clusterConnectsPath,
  clusterConsumerGroupsPath,
  clusterSchemasPath,
  clusterTopicsPath,
} from 'lib/paths';
import Topics from 'components/Topics/Topics';
import Schemas from 'components/Schemas/Schemas';
import Connect from 'components/Connect/Connect';
import ClusterContext from 'components/contexts/ClusterContext';
import BrokersContainer from 'components/Brokers/BrokersContainer';
import ConsumersGroupsContainer from 'components/ConsumerGroups/ConsumersGroupsContainer';

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

  const contextValue = React.useMemo(
    () => ({
      isReadOnly,
      hasKafkaConnectConfigured,
      hasSchemaRegistryConfigured,
    }),
    [features]
  );

  return (
    <ClusterContext.Provider value={contextValue}>
      <Switch>
        <Route
          path={clusterBrokersPath(':clusterName')}
          component={BrokersContainer}
        />
        <Route path={clusterTopicsPath(':clusterName')} component={Topics} />
        <Route
          path={clusterConsumerGroupsPath(':clusterName')}
          component={ConsumersGroupsContainer}
        />
        {hasSchemaRegistryConfigured && (
          <Route
            path={clusterSchemasPath(':clusterName')}
            component={Schemas}
          />
        )}
        {hasKafkaConnectConfigured && (
          <Route
            path={clusterConnectsPath(':clusterName')}
            component={Connect}
          />
        )}
        {hasKafkaConnectConfigured && (
          <Route
            path={clusterConnectorsPath(':clusterName')}
            component={Connect}
          />
        )}
        <Redirect
          from="/ui/clusters/:clusterName"
          to="/ui/clusters/:clusterName/brokers"
        />
      </Switch>
    </ClusterContext.Provider>
  );
};

export default Cluster;
