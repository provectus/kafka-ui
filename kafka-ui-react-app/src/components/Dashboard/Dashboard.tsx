import React from 'react';
import PageHeading from 'components/common/PageHeading/PageHeading';

import ClustersWidgetContainer from './ClustersWidget/ClustersWidgetContainer';

const Dashboard: React.FC = () => (
  <>
    <PageHeading text="Dashboard" />
    <ClustersWidgetContainer />
  </>
);

export default Dashboard;
