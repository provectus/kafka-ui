import React, { Suspense } from 'react';
import PageHeading from 'components/common/PageHeading/PageHeading';
import ClustersWidget from 'components/Dashboard/ClustersWidget/ClustersWidget';

const Dashboard: React.FC = () => (
  <>
    <PageHeading text="Dashboard" />
    <Suspense>
      <ClustersWidget />
    </Suspense>
  </>
);

export default Dashboard;
