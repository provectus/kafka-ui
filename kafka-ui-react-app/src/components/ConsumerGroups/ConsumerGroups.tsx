import React from 'react';
import { Route, Switch } from 'react-router-dom';
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
      <Route exact path={clusterConsumerGroupsPath()}>
        <BreadcrumbRoute>
          <ListContainer />
        </BreadcrumbRoute>
      </Route>
      <Route exact path={clusterConsumerGroupDetailsPath()}>
        <BreadcrumbRoute>
          <Details />
        </BreadcrumbRoute>
      </Route>
      <Route path={clusterConsumerGroupResetOffsetsPath()}>
        <BreadcrumbRoute>
          <ResetOffsets />
        </BreadcrumbRoute>
      </Route>
    </Switch>
  );
};

export default ConsumerGroups;
