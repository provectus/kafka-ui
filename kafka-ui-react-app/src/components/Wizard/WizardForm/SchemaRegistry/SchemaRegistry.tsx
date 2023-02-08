import React from 'react';
import * as S from 'components/Wizard/WizardForm/WizardForm.styled';
import { Button } from 'components/common/Button/Button';
import Input from 'components/common/Input/Input';
import { FormError } from 'components/common/Input/Input.styled';
import { ErrorMessage } from '@hookform/error-message';
import { useFormContext } from 'react-hook-form';
import Heading from 'components/common/heading/Heading.styled';
import { InputLabel } from 'components/common/Input/InputLabel.styled';

const SchemaRegistry = () => {
  const {
    setValue,
    register,
    reset,
    getValues,
    watch,
    formState: { errors },
  } = useFormContext();
  const schemaRegistry = watch('schemaRegistry');
  const showRegistryFrom: React.MouseEventHandler<HTMLButtonElement> = (e) => {
    e.preventDefault();
    if (schemaRegistry) {
      setValue('schemaRegistry', undefined);
    } else {
      reset(
        {
          ...getValues(),
          schemaRegistry: {
            url: '',
            isAuth: false,
            username: '',
            password: '',
          },
        },
        { keepDefaultValues: true }
      );
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
      <S.ArrayFieldWrapper>
        {schemaRegistry && (
          <>
            <div>
              <InputLabel htmlFor="schemaRegistry.url">URL</InputLabel>
              <Input
                id="schemaRegistry.url"
                name="schemaRegistry.url"
                type="text"
                placeholder="http://localhost:8081"
              />
              <FormError>
                <ErrorMessage errors={errors} name="schemaRegistry.url" />
              </FormError>
            </div>
            <div>
              <InputLabel htmlFor="schemaRegistry.isAuth">
                <input
                  {...register('schemaRegistry.isAuth')}
                  id="schemaRegistry.isAuth"
                  type="checkbox"
                />
                Schema registry is secured with auth?
              </InputLabel>
              <FormError>
                <ErrorMessage errors={errors} name="schemaRegistry.isAuth" />
              </FormError>
            </div>
            {schemaRegistry.isAuth && (
              <S.InputContainer>
                <div>
                  <InputLabel htmlFor="schemaRegistry.username">
                    Username *
                  </InputLabel>
                  <Input
                    id="schemaRegistry.username"
                    type="text"
                    name="schemaRegistry.username"
                  />
                  <FormError>
                    <ErrorMessage
                      errors={errors}
                      name="schemaRegistry.username"
                    />
                  </FormError>
                </div>
                <div>
                  <InputLabel htmlFor="schemaRegistry.password">
                    Password *
                  </InputLabel>
                  <Input
                    id="schemaRegistry.password"
                    type="password"
                    name="schemaRegistry.password"
                  />
                  <FormError>
                    <ErrorMessage
                      errors={errors}
                      name="schemaRegistry.password"
                    />
                  </FormError>
                </div>
              </S.InputContainer>
            )}
          </>
        )}
      </S.ArrayFieldWrapper>
    </>
  );
};
export default SchemaRegistry;
