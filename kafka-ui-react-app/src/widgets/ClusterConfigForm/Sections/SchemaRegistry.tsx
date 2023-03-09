import React from 'react';
import Input from 'components/common/Input/Input';
import { useFormContext } from 'react-hook-form';
import SectionHeader from 'widgets/ClusterConfigForm/common/SectionHeader';
import SSLForm from 'widgets/ClusterConfigForm/common/SSLForm';
import Credentials from 'widgets/ClusterConfigForm/common/Credentials';

const SchemaRegistry = () => {
  const { setValue, watch } = useFormContext();
  const schemaRegistry = watch('schemaRegistry');
  const toggleConfig = () => {
    setValue(
      'schemaRegistry',
      schemaRegistry ? undefined : { url: '', isAuth: false },
      { shouldValidate: true, shouldDirty: true, shouldTouch: true }
    );
  };
  return (
    <>
      <SectionHeader
        title="Schema Registry"
        adding={!schemaRegistry}
        addButtonText="Configure Schema Registry"
        onClick={toggleConfig}
      />
      {schemaRegistry && (
        <>
          <Input
            label="URL *"
            name="schemaRegistry.url"
            type="text"
            placeholder="http://localhost:8081"
            withError
          />
          <Credentials
            prefix="schemaRegistry"
            title="Is Schema Registry secured with auth?"
          />
          <SSLForm prefix="schemaRegistry.keystore" title="Keystore" />
        </>
      )}
    </>
  );
};
export default SchemaRegistry;
