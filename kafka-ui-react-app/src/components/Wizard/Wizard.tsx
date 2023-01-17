import React from 'react';
import { Route, Routes } from 'react-router-dom';

import WizardForm from './WizardForm/WizardForm';

const Wizard: React.FC = () => (
  <Routes>
    <Route index element={<WizardForm />} />
  </Routes>
);

export default Wizard;
