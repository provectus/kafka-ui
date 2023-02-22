import React from 'react';
import Input from 'components/common/Input/Input';
import Checkbox from 'components/common/Checkbox/Checkbox';
import Fileupload from 'widgets/ClusterConfigForm/Fileupload';

const SaslGssapi: React.FC = () => {
  return (
    <>
      <Input
        label="Kerberos service name"
        type="text"
        name="auth.props.saslKerberosServiceName"
        withError
      />
      <Checkbox name="auth.props.storeKey" label="Store Key" />
      <Fileupload name="auth.props.keyTabFile" label="Key Tab (optional)" />
      <Input
        type="text"
        name="auth.props.principal"
        label="Principal *"
        withError
      />
    </>
  );
};
export default SaslGssapi;
