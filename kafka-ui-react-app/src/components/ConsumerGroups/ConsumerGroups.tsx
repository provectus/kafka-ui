import React from 'react';
import { Switch } from 'react-router-dom';
import Details from 'components/ConsumerGroups/Details/Details';
import ListContainer from 'components/ConsumerGroups/List/ListContainer';
import ResetOffsets from 'components/ConsumerGroups/Details/ResetOffsets/ResetOffsets';
import { BreadcrumbRoute } from 'components/common/Breadcrumb/Breadcrumb.route';
import {
  clusterConsumerGroupDetailsPath,
  clusterConsumerGroupResetOffsetsPath,
  clusterConsumerGroupsPath,
} from 'lib/paths';

const ConsumerGroups: React.FC = () => {
  return (
    <Switch>
      <BreadcrumbRoute exact path={clusterConsumerGroupsPath(':clusterName')}>
        <ListContainer />
      </BreadcrumbRoute>
      <BreadcrumbRoute
        exact
        path={clusterConsumerGroupDetailsPath(
          ':clusterName',
          ':consumerGroupID'
        )}
      >
        <Details />
      </BreadcrumbRoute>
      <BreadcrumbRoute
        path={clusterConsumerGroupResetOffsetsPath(
          ':clusterName',
          ':consumerGroupID'
        )}
      >
        <ResetOffsets />
      </BreadcrumbRoute>
    </Switch>
  );
};

export default ConsumerGroups;
