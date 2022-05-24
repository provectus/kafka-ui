import React from 'react';
import { Route, Switch } from 'react-router-dom';
import {
  clusterTopicCopyPath,
  clusterTopicNewPath,
  clusterTopicPath,
  clusterTopicsPath,
} from 'lib/paths';
import { BreadcrumbRoute } from 'components/common/Breadcrumb/Breadcrumb.route';

import ListContainer from './List/ListContainer';
import TopicContainer from './Topic/TopicContainer';
import New from './New/New';

const Topics: React.FC = () => (
  <Switch>
    <Route exact path={clusterTopicsPath()}>
      <BreadcrumbRoute>
        <ListContainer />
      </BreadcrumbRoute>
    </Route>
    <Route exact path={clusterTopicNewPath()}>
      <BreadcrumbRoute>
        <New />
      </BreadcrumbRoute>
    </Route>
    <Route exact path={clusterTopicCopyPath()}>
      <BreadcrumbRoute>
        <New />
      </BreadcrumbRoute>
    </Route>
    <Route path={clusterTopicPath()}>
      <BreadcrumbRoute>
        <TopicContainer />
      </BreadcrumbRoute>
    </Route>
  </Switch>
);

export default Topics;
