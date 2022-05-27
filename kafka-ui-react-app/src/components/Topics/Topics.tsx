import React from 'react';
import { Route, Routes } from 'react-router-dom';
import {
  clusterTopicCopyRelativePath,
  clusterTopicNewRelativePath,
  getNonExactPath,
  RouteParams,
} from 'lib/paths';
import { BreadcrumbRoute } from 'components/common/Breadcrumb/Breadcrumb.route';

import ListContainer from './List/ListContainer';
import TopicContainer from './Topic/TopicContainer';
import New from './New/New';

const Topics: React.FC = () => (
  <Routes>
    <Route
      index
      element={
        <BreadcrumbRoute>
          <ListContainer />
        </BreadcrumbRoute>
      }
    />
    <Route
      path={clusterTopicNewRelativePath}
      element={
        <BreadcrumbRoute>
          <New />
        </BreadcrumbRoute>
      }
    />
    <Route
      path={clusterTopicCopyRelativePath}
      element={
        <BreadcrumbRoute>
          <New />
        </BreadcrumbRoute>
      }
    />
    <Route
      path={getNonExactPath(RouteParams.topicName)}
      element={
        <BreadcrumbRoute>
          <TopicContainer />
        </BreadcrumbRoute>
      }
    />
  </Routes>
);

export default Topics;
