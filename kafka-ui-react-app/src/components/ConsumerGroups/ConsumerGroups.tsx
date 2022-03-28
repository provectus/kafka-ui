import React from 'react';
import { ClusterName } from 'redux/interfaces';
import { Switch, useParams } from 'react-router-dom';
import PageLoader from 'components/common/PageLoader/PageLoader';
import Details from 'components/ConsumerGroups/Details/Details';
import ListContainer from 'components/ConsumerGroups/List/ListContainer';
import ResetOffsets from 'components/ConsumerGroups/Details/ResetOffsets/ResetOffsets';
import { useAppDispatch, useAppSelector } from 'lib/hooks/redux';
import {
  fetchConsumerGroupsPaged,
  getAreConsumerGroupsPagedFulfilled,
  getConsumerGroupsOrderBy,
  getConsumerGroupsSortOrder,
} from 'redux/reducers/consumerGroups/consumerGroupsSlice';
import { BreadcrumbRoute } from 'components/common/Breadcrumb/Breadcrumb.route';

const ConsumerGroups: React.FC = () => {
  const dispatch = useAppDispatch();
  const { clusterName } = useParams<{ clusterName: ClusterName }>();
  const isFetched = useAppSelector(getAreConsumerGroupsPagedFulfilled);
  const orderBy = useAppSelector(getConsumerGroupsOrderBy);
  const sortOrder = useAppSelector(getConsumerGroupsSortOrder);
  React.useEffect(() => {
    dispatch(
      fetchConsumerGroupsPaged({
        clusterName,
        orderBy: orderBy || undefined,
        sortOrder,
      })
    );
  }, [clusterName, orderBy, sortOrder, dispatch]);

  if (isFetched) {
    return (
      <Switch>
        <BreadcrumbRoute
          exact
          path="/ui/clusters/:clusterName/consumer-groups"
          component={ListContainer}
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
