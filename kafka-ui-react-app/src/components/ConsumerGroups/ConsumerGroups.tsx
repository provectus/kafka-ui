import React from 'react';
import { ClusterName } from 'redux/interfaces';
import { Switch, Route, useParams } from 'react-router-dom';
import PageLoader from 'components/common/PageLoader/PageLoader';
import Details from 'components/ConsumerGroups/Details/Details';
import List from 'components/ConsumerGroups/List/List';
import ResetOffsets from 'components/ConsumerGroups/Details/ResetOffsets/ResetOffsets';
import { useAppDispatch, useAppSelector } from 'lib/hooks/redux';
import {
  fetchConsumerGroups,
  getAreConsumerGroupsFulfilled,
} from 'redux/reducers/consumerGroups/consumerGroupsSlice';

const ConsumerGroups: React.FC = () => {
  const dispatch = useAppDispatch();
  const { clusterName } = useParams<{ clusterName: ClusterName }>();
  const isFetched = useAppSelector(getAreConsumerGroupsFulfilled);
  React.useEffect(() => {
    dispatch(fetchConsumerGroups(clusterName));
  }, [fetchConsumerGroups, clusterName]);

  if (isFetched) {
    return (
      <Switch>
        <Route
          exact
          path="/ui/clusters/:clusterName/consumer-groups"
          component={List}
        />
        <Route
          exact
          path="/ui/clusters/:clusterName/consumer-groups/:consumerGroupID"
          component={Details}
        />
        <Route
          path="/ui/clusters/:clusterName/consumer-groups/:consumerGroupID/reset-offsets"
          component={ResetOffsets}
        />
      </Switch>
    );
  }

  return <PageLoader />;
};

export default ConsumerGroups;
