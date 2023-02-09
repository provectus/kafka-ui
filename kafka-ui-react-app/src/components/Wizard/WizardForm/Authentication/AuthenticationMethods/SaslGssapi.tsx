import React from 'react';
import { useFormContext } from 'react-hook-form';
import Input from 'components/common/Input/Input';
import Checkbox from 'components/common/Checkbox/Checkbox';
import FileField from 'components/common/FileField/FileField';

const SaslGssapi: React.FC = () => {
  const methods = useFormContext();
  const useKeyTab = methods.watch('authentication.useKeyTab');
  return (
    <>
      <Input
        label="Kerberos service name"
        type="text"
        name="authentication.saslKerberosServiceName"
        withError
      />

      <Checkbox name="authentication.useKeyTab" label="Use Key Tab" />

      <Checkbox name="authentication.storeKey" label="Store Key" />

      {useKeyTab && <FileField name="authentication.keyTab" label="Key Tab" />}

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
