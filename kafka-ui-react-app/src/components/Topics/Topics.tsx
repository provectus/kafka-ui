import React from 'react';
import { Route, Routes } from 'react-router-dom';
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
  <Routes>
    <Route
      path={clusterTopicsPath()}
      element={
        <BreadcrumbRoute>
          <ListContainer />
        </BreadcrumbRoute>
      }
    />
    <Route
      path={clusterTopicNewPath()}
      element={
        <BreadcrumbRoute>
          <New />
        </BreadcrumbRoute>
      }
    />
    <Route
      path={clusterTopicCopyPath()}
      element={
        <BreadcrumbRoute>
          <New />
        </BreadcrumbRoute>
      }
    />
    <Route
      path={clusterTopicPath()}
      element={
        <BreadcrumbRoute>
          <TopicContainer />
        </BreadcrumbRoute>
      }
    />
  </Routes>
);

export default Topics;
