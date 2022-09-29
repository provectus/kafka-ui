import React from 'react';
import { Route, Routes } from 'react-router-dom';
import { clusterKsqlDbQueryRelativePath } from 'lib/paths';
import List from 'components/KsqlDb/List/List';
import Query from 'components/KsqlDb/Query/Query';

const KsqlDb: React.FC = () => {
  return (
    <Routes>
      <Route path="/*" element={<List />} />
      <Route path={clusterKsqlDbQueryRelativePath} element={<Query />} />
    </Routes>
  );
};

export default KsqlDb;
