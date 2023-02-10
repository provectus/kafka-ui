import React from 'react';
import Input from 'components/common/Input/Input';
import Checkbox from 'components/common/Checkbox/Checkbox';
import Fileupload from 'components/Wizard/WizardForm/Fileupload';

const SaslGssapi: React.FC = () => {
  return (
    <>
      <Input
        label="Kerberos service name"
        type="text"
        name="authentication.saslKerberosServiceName"
        withError
      />
      <Checkbox name="authentication.storeKey" label="Store Key" />
      <Fileupload name="authentication.keyTabFile" label="Key Tab" />
      <Input
        type="text"
        name="authentication.principal"
        label="Principal *"
        withError
      />
    </>
  );
};
export default SaslGssapi;
