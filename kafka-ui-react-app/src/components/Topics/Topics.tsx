import React from 'react';
import { Route, Routes } from 'react-router-dom';
import {
  clusterTopicCopyRelativePath,
  clusterTopicNewRelativePath,
  getNonExactPath,
  RouteParams,
} from 'lib/paths';
import { BreadcrumbRoute } from 'components/common/Breadcrumb/Breadcrumb.route';

import New from './New/New';
import ListPage from './List/ListPage';
import Topic from './Topic/Topic';

const Topics: React.FC = () => (
  <Routes>
    <Route
      index
      element={
        <BreadcrumbRoute>
          <ListPage />
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
          <Topic />
        </BreadcrumbRoute>
      }
    />
  </Routes>
);

export default Topics;
