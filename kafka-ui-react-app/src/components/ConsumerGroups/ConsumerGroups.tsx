import React from 'react';
import { Route, Routes } from 'react-router-dom';
import Details from 'components/ConsumerGroups/Details/Details';
import ResetOffsets from 'components/ConsumerGroups/Details/ResetOffsets/ResetOffsets';
import {
  clusterConsumerGroupResetOffsetsRelativePath,
  RouteParams,
} from 'lib/paths';

import List from './List';

const ConsumerGroups: React.FC = () => {
  return (
    <Routes>
      <Route index element={<List />} />
      <Route path={RouteParams.consumerGroupID} element={<Details />} />
      <Route
        path={clusterConsumerGroupResetOffsetsRelativePath}
        element={<ResetOffsets />}
      />
    </Routes>
  );
};

export default ConsumerGroups;
