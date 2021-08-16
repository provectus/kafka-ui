import React from 'react';
import { ClusterName } from 'redux/interfaces';
import { Switch, Route } from 'react-router-dom';
import PageLoader from 'components/common/PageLoader/PageLoader';
import DetailsContainer from 'components/ConsumerGroups/Details/DetailsContainer';
import ListContainer from 'components/ConsumerGroups/List/ListContainer';

import ResetOffsetsContainer from './Details/ResetOffsets/ResetOffsetsContainer';

interface Props {
  clusterName: ClusterName;
  isFetched: boolean;
  fetchConsumerGroupsList: (clusterName: ClusterName) => void;
}

const ConsumerGroups: React.FC<Props> = ({
  clusterName,
  isFetched,
  fetchConsumerGroupsList,
}) => {
  React.useEffect(() => {
    fetchConsumerGroupsList(clusterName);
  }, [fetchConsumerGroupsList, clusterName]);

  if (isFetched) {
    return (
      <Switch>
        <Route
          exact
          path="/ui/clusters/:clusterName/consumer-groups"
          component={ListContainer}
        />
        <Route
          exact
          path="/ui/clusters/:clusterName/consumer-groups/:consumerGroupID"
          component={DetailsContainer}
        />
        <Route
          path="/ui/clusters/:clusterName/consumer-groups/:consumerGroupID/reset-offsets"
          component={ResetOffsetsContainer}
        />
      </Switch>
    );
  }

  return <PageLoader />;
};

export default ConsumerGroups;
