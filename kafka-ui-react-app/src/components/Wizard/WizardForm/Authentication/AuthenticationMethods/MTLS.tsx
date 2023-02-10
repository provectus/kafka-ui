import React from 'react';
import Input from 'components/common/Input/Input';
import FileField from 'components/common/FileField/FileField';

const MTLS: React.FC = () => (
  <>
    <FileField
      name="authentication.sslKeystoreLocation"
      label="ssl.keystore.location"
    />
    <Input
      label="ssl.keystore.password *"
      type="password"
      name="authentication.sslKeystorePassword"
      withError
    />
    <Input
      label="ssl.key.password *"
      type="password"
      name="authentication.sslKeyPassword"
      withError
    />
  </>
);

export default MTLS;
