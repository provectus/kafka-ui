import React from 'react';
import { Route, Routes } from 'react-router-dom';

import WizardForm from './WizardForm/WizardForm';

const ClusterConfig: React.FC = () => (
  <Routes>
    <Route index element={<WizardForm />} />
  </Routes>
);

export default ClusterConfig;
