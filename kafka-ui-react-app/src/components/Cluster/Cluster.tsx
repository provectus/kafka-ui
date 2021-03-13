import React from 'react';
import { useSelector } from 'react-redux';
import { Switch, Route, Redirect, useParams } from 'react-router-dom';
import BrokersContainer from 'components/Brokers/BrokersContainer';
import TopicsContainer from 'components/Topics/TopicsContainer';
import ConsumersGroupsContainer from 'components/ConsumerGroups/ConsumersGroupsContainer';
import Schemas from 'components/Schemas/Schemas';
import { getClustersReadonlyStatus } from 'redux/reducers/clusters/selectors';
import ClusterContext from 'components/contexts/ClusterContext';

const Cluster: React.FC = () => {
  const { clusterName } = useParams<{ clusterName: string }>();
  const isReadOnly = useSelector(getClustersReadonlyStatus(clusterName));
  return (
    <ClusterContext.Provider value={{ isReadOnly }}>
      <Switch>
        <Route
          path="/ui/clusters/:clusterName/brokers"
          component={BrokersContainer}
        />
        <Route
          path="/ui/clusters/:clusterName/topics"
          component={TopicsContainer}
        />
        <Route
          path="/ui/clusters/:clusterName/consumer-groups"
          component={ConsumersGroupsContainer}
        />
        <Route path="/ui/clusters/:clusterName/schemas" component={Schemas} />
        <Redirect
          from="/ui/clusters/:clusterName"
          to="/ui/clusters/:clusterName/brokers"
        />
      </Switch>
    </ClusterContext.Provider>
  );
};

export default Cluster;
