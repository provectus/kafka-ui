import React from 'react';
import { Route, Routes } from 'react-router-dom';
import { clusterKsqlDbQueryRelativePath } from 'lib/paths';
import List from 'components/KsqlDb/List/List';
import Query from 'components/KsqlDb/Query/Query';
import { BreadcrumbRoute } from 'components/common/Breadcrumb/Breadcrumb.route';

const KsqlDb: React.FC = () => {
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
        path={clusterKsqlDbQueryRelativePath}
        element={
          <BreadcrumbRoute>
            <Query />
          </BreadcrumbRoute>
        }
      />
    </Routes>
  );
};

export default KsqlDb;
