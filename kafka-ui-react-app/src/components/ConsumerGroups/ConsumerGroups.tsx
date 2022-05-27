import React from 'react';
import { Route, Routes } from 'react-router-dom';
import Details from 'components/ConsumerGroups/Details/Details';
import ListContainer from 'components/ConsumerGroups/List/ListContainer';
import ResetOffsets from 'components/ConsumerGroups/Details/ResetOffsets/ResetOffsets';
import { BreadcrumbRoute } from 'components/common/Breadcrumb/Breadcrumb.route';
import {
  clusterConsumerGroupDetailsPath,
  clusterConsumerGroupResetOffsetsPath,
  clusterConsumerGroupsPath,
} from 'lib/paths';

const ConsumerGroups: React.FC = () => {
  return (
    <Routes>
      <Route
        path={clusterConsumerGroupsPath()}
        element={
          <BreadcrumbRoute>
            <ListContainer />
          </BreadcrumbRoute>
        }
      />
      <Route
        path={clusterConsumerGroupDetailsPath()}
        element={
          <BreadcrumbRoute>
            <Details />
          </BreadcrumbRoute>
        }
      />
      <Route
        path={clusterConsumerGroupResetOffsetsPath()}
        element={
          <BreadcrumbRoute>
            <ResetOffsets />
          </BreadcrumbRoute>
        }
      />
    </Routes>
  );
};

export default ConsumerGroups;
