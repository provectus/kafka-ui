import React from 'react';
import Input from 'components/common/Input/Input';
import { useFormContext } from 'react-hook-form';
import Checkbox from 'components/common/Checkbox/Checkbox';
import {
  FlexGrow1,
  FlexRow,
} from 'widgets/ClusterConfigForm/ClusterConfigForm.styled';
import SectionHeader from 'widgets/ClusterConfigForm/SectionHeader';

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
          <Checkbox
            name="schemaRegistry.isAuth"
            label="Is schema registry  secured with auth?"
          />
          {schemaRegistry.isAuth && (
            <FlexRow>
              <FlexGrow1>
                <Input
                  label="Username *"
                  type="text"
                  name="schemaRegistry.username"
                  withError
                />
              </FlexGrow1>
              <FlexGrow1>
                <Input
                  label="Password *"
                  type="password"
                  name="schemaRegistry.password"
                  withError
                />
              </FlexGrow1>
            </FlexRow>
          )}
        </>
      )}
    </>
  );
};
export default SchemaRegistry;
