import React from 'react';
import { Switch } from 'react-router-dom';
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
    <BreadcrumbRoute exact path={clusterTopicsPath(':clusterName')}>
      <ListContainer />
    </BreadcrumbRoute>
    <BreadcrumbRoute exact path={clusterTopicNewPath(':clusterName')}>
      <New />
    </BreadcrumbRoute>
    <BreadcrumbRoute exact path={clusterTopicCopyPath(':clusterName')}>
      <New />
    </BreadcrumbRoute>
    <BreadcrumbRoute path={clusterTopicPath(':clusterName', ':topicName')}>
      <TopicContainer />
    </BreadcrumbRoute>
  </Switch>
);

export default Topics;
