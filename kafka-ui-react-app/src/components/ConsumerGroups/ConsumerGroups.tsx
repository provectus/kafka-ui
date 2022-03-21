import React from 'react';
import { ClusterName } from 'redux/interfaces';
import { Switch, useParams } from 'react-router-dom';
import PageLoader from 'components/common/PageLoader/PageLoader';
import Details from 'components/ConsumerGroups/Details/Details';
import List from 'components/ConsumerGroups/List/List';
import ResetOffsets from 'components/ConsumerGroups/Details/ResetOffsets/ResetOffsets';
import { useAppDispatch, useAppSelector } from 'lib/hooks/redux';
import {
  fetchConsumerGroups,
  getAreConsumerGroupsFulfilled,
} from 'redux/reducers/consumerGroups/consumerGroupsSlice';
import { BreadcrumbRoute } from 'components/common/Breadcrumb/Breadcrumb.route';

const ConsumerGroups: React.FC = () => {
  const dispatch = useAppDispatch();
  const { clusterName } = useParams<{ clusterName: ClusterName }>();
  const isFetched = useAppSelector(getAreConsumerGroupsFulfilled);
  React.useEffect(() => {
    dispatch(fetchConsumerGroups(clusterName));
  }, [clusterName, dispatch]);

  if (isFetched) {
    return (
      <Switch>
        <BreadcrumbRoute
          exact
          path="/ui/clusters/:clusterName/consumer-groups"
          component={List}
        />
        <BreadcrumbRoute
          exact
          path="/ui/clusters/:clusterName/consumer-groups/:consumerGroupID"
          component={Details}
        />
        <BreadcrumbRoute
          path="/ui/clusters/:clusterName/consumer-groups/:consumerGroupID/reset-offsets"
          component={ResetOffsets}
        />
      </Switch>
    );
  }

  return <PageLoader />;
};

export default ConsumerGroups;
