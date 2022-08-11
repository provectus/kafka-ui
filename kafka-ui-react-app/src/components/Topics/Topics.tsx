import React from 'react';
import { Route, Routes } from 'react-router-dom';
import {
  clusterTopicCopyRelativePath,
  clusterTopicNewRelativePath,
  getNonExactPath,
  RouteParams,
} from 'lib/paths';

import New from './New/New';
import ListPage from './List/ListPage';
import Topic from './Topic/Topic';

const Topics: React.FC = () => (
  <Routes>
    <Route index element={<ListPage />} />
    <Route path={clusterTopicNewRelativePath} element={<New />} />
    <Route path={clusterTopicCopyRelativePath} element={<New />} />
    <Route path={getNonExactPath(RouteParams.topicName)} element={<Topic />} />
  </Routes>
);

export default Topics;
