import React from 'react';
import { Button } from 'components/common/Button/Button';
import Input from 'components/common/Input/Input';
import { useFormContext } from 'react-hook-form';
import Heading from 'components/common/heading/Heading.styled';
import Checkbox from 'components/common/Checkbox/Checkbox';
import {
  FlexGrow1,
  FlexRow,
} from 'components/Wizard/WizardForm/WizardForm.styled';

const SchemaRegistry = () => {
  const { setValue, watch } = useFormContext();
  const schemaRegistry = watch('schemaRegistry');
  const showRegistryFrom: React.MouseEventHandler<HTMLButtonElement> = (e) => {
    e.preventDefault();
    if (schemaRegistry) {
      setValue('schemaRegistry', undefined);
    } else {
      setValue('schemaRegistry', {
        url: '',
        isAuth: false,
        username: '',
        password: '',
      });
    }
  };
  return (
    <>
      <Heading level={3}>Schema Registry</Heading>
      <div>
        <Button
          buttonSize="M"
          buttonType="primary"
          onClick={(e) => showRegistryFrom(e)}
        >
          {!schemaRegistry ? 'Add Schema Registry' : 'Remove from config'}
        </Button>
      </div>
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
