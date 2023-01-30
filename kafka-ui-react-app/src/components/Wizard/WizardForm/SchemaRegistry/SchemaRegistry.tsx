import React, { useState } from 'react';
import * as S from 'components/Wizard/WizardForm/WizardForm.styled';
import { Button } from 'components/common/Button/Button';
import Input from 'components/common/Input/Input';
import { FormError } from 'components/common/Input/Input.styled';
import { ErrorMessage } from '@hookform/error-message';
import { useFormContext } from 'react-hook-form';

const SchemaRegistry = () => {
  const [newSchemaRegistry, setNewSchemaRegistry] = useState(false);
  const methods = useFormContext();
  const registry = () => {
    setNewSchemaRegistry(!newSchemaRegistry);
    if (!newSchemaRegistry) {
      methods.reset({ url: '' });
    }
  };
  const isAuth = methods.watch('schemaRegistry.isAuth');
  return (
    <S.Section>
      <S.SectionName>Schema Registry</S.SectionName>
      <div>
        <Button buttonSize="M" buttonType="primary" onClick={registry}>
          {!newSchemaRegistry ? 'Add Schema Registry' : 'Remove from config'}
        </Button>
        {newSchemaRegistry && (
          <>
            <S.PartStyled>
              <label htmlFor="schemaRegistry.url">URL</label>{' '}
              <Input
                id="schemaRegistry.url"
                name="schemaRegistry.url"
                type="text"
                placeholder="http://localhost:8081"
              />
              <FormError>
                <ErrorMessage
                  errors={methods.formState.errors}
                  name="schemaRegistry.url"
                />
              </FormError>
            </S.PartStyled>
            <S.PartStyled>
              <S.CheckboxWrapper>
                <input
                  {...methods.register('schemaRegistry.isAuth')}
                  id="schemaRegistry.isAuth"
                  type="checkbox"
                />
                <label htmlFor="schemaRegistry.isAuth">
                  Schema registry is secured with auth?
                </label>
                <FormError>
                  <ErrorMessage
                    errors={methods.formState.errors}
                    name="schemaRegistry.isAuth"
                  />
                </FormError>
              </S.CheckboxWrapper>
            </S.PartStyled>
            {isAuth && (
              <>
                <S.PartStyled>
                  <S.ItemLabelRequired>
                    <label htmlFor="schemaRegistry.username">Username</label>{' '}
                  </S.ItemLabelRequired>
                  <Input
                    id="schemaRegistry.username"
                    type="text"
                    name="schemaRegistry.username"
                  />
                  <FormError>
                    <ErrorMessage
                      errors={methods.formState.errors}
                      name="schemaRegistry.username"
                    />
                  </FormError>
                </S.PartStyled>
                <S.PartStyled>
                  <S.ItemLabelRequired>
                    <label htmlFor="schemaRegistry.password">Password</label>{' '}
                  </S.ItemLabelRequired>
                  <Input
                    id="schemaRegistry.password"
                    type="password"
                    name="schemaRegistry.password"
                  />
                  <FormError>
                    <ErrorMessage
                      errors={methods.formState.errors}
                      name="schemaRegistry.password"
                    />
                  </FormError>
                </S.PartStyled>
              </>
            )}
          </>
        )}
      </div>
    </S.Section>
  );
};
export default SchemaRegistry;
