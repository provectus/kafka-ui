import React from 'react';
import { Switch } from 'react-router-dom';
import Details from 'components/ConsumerGroups/Details/Details';
import List from 'components/ConsumerGroups/List/List';
import ResetOffsets from 'components/ConsumerGroups/Details/ResetOffsets/ResetOffsets';
import { BreadcrumbRoute } from 'components/common/Breadcrumb/Breadcrumb.route';

const ConsumerGroups: React.FC = () => {
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
};

export default ConsumerGroups;
