import React from 'react';

import WizardForm from './WizardForm/WizardForm';

const NewClusterConfig: React.FC = () => (
  <WizardForm initialValues={{ authMethod: 'none' }} />
);

export default NewClusterConfig;
