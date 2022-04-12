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
import Copy from './Copy/Copy';

const Topics: React.FC = () => (
  <Switch>
    <BreadcrumbRoute
      exact
      path={clusterTopicsPath(':clusterName')}
      component={ListContainer}
    />
    <BreadcrumbRoute
      exact
      path={clusterTopicNewPath(':clusterName')}
      component={New}
    />
    <BreadcrumbRoute
      path={clusterTopicCopyPath(':clusterName/topics/copy')}
      component={Copy}
    />
    <BreadcrumbRoute
      path={clusterTopicPath(':clusterName', ':topicName')}
      component={TopicContainer}
    />
  </Switch>
);

export default Topics;
