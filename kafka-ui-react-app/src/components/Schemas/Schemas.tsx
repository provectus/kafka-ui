import React from 'react';
import { Route, Routes } from 'react-router-dom';
import {
  clusterSchemaEditRelativePath,
  clusterSchemaNewRelativePath,
  clusterSchemaSchemaDiffRelativePath,
  RouteParams,
} from 'lib/paths';
import List from 'components/Schemas/List/List';
import Details from 'components/Schemas/Details/Details';
import New from 'components/Schemas/New/New';
import Edit from 'components/Schemas/Edit/Edit';
import DiffContainer from 'components/Schemas/Diff/DiffContainer';
import { BreadcrumbRoute } from 'components/common/Breadcrumb/Breadcrumb.route';

const Schemas: React.FC = () => {
  return (
    <Routes>
      <Route
        index
        element={
          <BreadcrumbRoute>
            <List />
          </BreadcrumbRoute>
        }
      />
      <Route
        path={clusterSchemaNewRelativePath}
        element={
          <BreadcrumbRoute>
            <New />
          </BreadcrumbRoute>
        }
      />
      <Route
        path={RouteParams.subject}
        element={
          <BreadcrumbRoute>
            <Details />
          </BreadcrumbRoute>
        }
      />
      <Route
        path={clusterSchemaEditRelativePath}
        element={
          <BreadcrumbRoute>
            <Edit />
          </BreadcrumbRoute>
        }
      />
      <Route
        path={clusterSchemaSchemaDiffRelativePath}
        element={
          <BreadcrumbRoute>
            <DiffContainer />
          </BreadcrumbRoute>
        }
      />
    </Routes>
  );
};

export default Schemas;
