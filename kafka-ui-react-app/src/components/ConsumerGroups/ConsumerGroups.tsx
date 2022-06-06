import React from 'react';
import { Route, Routes } from 'react-router-dom';
import Details from 'components/ConsumerGroups/Details/Details';
import ListContainer from 'components/ConsumerGroups/List/ListContainer';
import ResetOffsets from 'components/ConsumerGroups/Details/ResetOffsets/ResetOffsets';
import { BreadcrumbRoute } from 'components/common/Breadcrumb/Breadcrumb.route';
import {
  clusterConsumerGroupResetOffsetsRelativePath,
  RouteParams,
} from 'lib/paths';

const ConsumerGroups: React.FC = () => {
  return (
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
        path={RouteParams.consumerGroupID}
        element={
          <BreadcrumbRoute>
            <Details />
          </BreadcrumbRoute>
        }
      />
      <Route
        path={clusterConsumerGroupResetOffsetsRelativePath}
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
