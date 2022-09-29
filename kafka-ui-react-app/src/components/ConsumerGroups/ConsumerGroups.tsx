import React from 'react';
import { Route, Routes } from 'react-router-dom';
import Details from 'components/ConsumerGroups/Details/Details';
import ListContainer from 'components/ConsumerGroups/List/ListContainer';
import ResetOffsets from 'components/ConsumerGroups/Details/ResetOffsets/ResetOffsets';
import {
  clusterConsumerGroupResetOffsetsRelativePath,
  RouteParams,
} from 'lib/paths';

const ConsumerGroups: React.FC = () => {
  return (
    <Routes>
      <Route index element={<ListContainer />} />
      <Route path={RouteParams.consumerGroupID} element={<Details />} />
      <Route
        path={clusterConsumerGroupResetOffsetsRelativePath}
        element={<ResetOffsets />}
      />
    </Routes>
  );
};

export default ConsumerGroups;
