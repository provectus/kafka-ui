import React from 'react';
import Breadcrumb from 'components/common/Breadcrumb/Breadcrumb';

import ClustersWidgetContainer from './ClustersWidget/ClustersWidgetContainer';

const Dashboard: React.FC = () => (
  <div className="section">
    <div className="level">
      <div className="level-item level-left">
        <Breadcrumb>Dashboard</Breadcrumb>
      </div>
    </div>

    <ClustersWidgetContainer />
  </div>
);

export default Dashboard;
