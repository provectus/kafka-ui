import React from 'react';
import { useSelector } from 'react-redux';
import { Switch, Route, Redirect, useParams } from 'react-router-dom';
import {
  getClustersFeatures,
  getClustersReadonlyStatus,
} from 'redux/reducers/clusters/selectors';
import {
  clusterBrokersPath,
  clusterConnectorsPath,
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
import { ClusterFeaturesEnum } from 'generated-sources';

const Cluster: React.FC = () => {
  const { clusterName } = useParams<{ clusterName: string }>();
  const isReadOnly = useSelector(getClustersReadonlyStatus(clusterName));
  const features = useSelector(getClustersFeatures(clusterName));

  const contextValue = React.useMemo(
    () => ({
      isReadOnly,
      hasKafkaConnectConfigured: features.includes(
        ClusterFeaturesEnum.KAFKA_CONNECT
      ),
      hasSchemaRegistryConfigured: features.includes(
        ClusterFeaturesEnum.SCHEMA_REGISTRY
      ),
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
        <Route path={clusterSchemasPath(':clusterName')} component={Schemas} />
        <Route
          path={clusterConnectorsPath(':clusterName')}
          component={Connect}
        />
        <Redirect
          from="/ui/clusters/:clusterName"
          to="/ui/clusters/:clusterName/brokers"
        />
      </Switch>
    </ClusterContext.Provider>
  );
};

export default Cluster;
