import React from 'react';
import { useFormContext } from 'react-hook-form';
import Input from 'components/common/Input/Input';
import Checkbox from 'components/common/Checkbox/Checkbox';
import FileField from 'components/common/FileField/FileField';

const MTLS: React.FC = () => {
  const { watch } = useFormContext();
  const selfSignedCertificate = watch('selfSignedCertificate');
  return (
    <>
      <Checkbox name="selfSignedCertificate" label="Self Signed Certificate" />

      {selfSignedCertificate && (
        <>
          <FileField
            name="authentication.sslTruststoreLocation"
            label="ssl.truststore.location"
          />

          <Input
            label="ssl.truststore.password *"
            type="password"
            name="authentication.sslTruststorePassword"
            withError
          />
        </>
      )}

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
};
export default MTLS;
