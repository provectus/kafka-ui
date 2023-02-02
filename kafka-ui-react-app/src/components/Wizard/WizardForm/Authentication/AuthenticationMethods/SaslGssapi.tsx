import { ErrorMessage } from '@hookform/error-message';
import React from 'react';
import { useFormContext } from 'react-hook-form';
import * as S from 'components/Wizard/WizardForm/WizardForm.styled';
import Input from 'components/common/Input/Input';
import { FormError } from 'components/common/Input/Input.styled';

const SaslGssapi: React.FC = () => {
  const methods = useFormContext();
  const useKeyTab = methods.watch('authentication.useKeyTab');
  return (
    <>
      <S.PartStyled>
        <S.ItemLabelRequired>
          <label htmlFor="authentication.saslKerberosServiceName">
            Kerberos service name
          </label>{' '}
        </S.ItemLabelRequired>
        <Input
          id="authentication.saslKerberosServiceName"
          type="text"
          name="authentication.saslKerberosServiceName"
        />
        <FormError>
          <ErrorMessage
            errors={methods.formState.errors}
            name="authentication.saslKerberosServiceName"
          />
        </FormError>
      </S.PartStyled>
      <S.PartStyled>
        <S.CheckboxWrapper>
          <input
            {...methods.register('authentication.useKeyTab')}
            id="authentication.useKeyTab"
            name="authentication.useKeyTab"
            type="checkbox"
          />
          <label htmlFor="authentication.useKeyTab">Use Key Tab</label>
          <FormError>
            <ErrorMessage
              errors={methods.formState.errors}
              name="authentication.useKeyTab"
            />
          </FormError>
        </S.CheckboxWrapper>
      </S.PartStyled>
      <S.PartStyled>
        <S.CheckboxWrapper>
          <input
            {...methods.register('authentication.storeKey')}
            id="authentication.storeKey"
            name="authentication.storeKey"
            type="checkbox"
          />
          <label htmlFor="authentication.storeKey">Store Key</label>
          <FormError>
            <ErrorMessage
              errors={methods.formState.errors}
              name="authentication.storeKey"
            />
          </FormError>
        </S.CheckboxWrapper>
      </S.PartStyled>
      {useKeyTab && (
        <S.PartStyled>
          <S.FileWrapper>
            <label htmlFor="authentication.keyTab">Key Tab</label>
            <input
              {...methods.register('authentication.keyTab')}
              name="authentication.keyTab"
              type="file"
            />

            <FormError>
              <ErrorMessage
                errors={methods.formState.errors}
                name="authentication.keyTab"
              />
            </FormError>
          </S.FileWrapper>
        </S.PartStyled>
      )}
      <S.PartStyled>
        <S.ItemLabelRequired>
          <label htmlFor="authentication.principal">Principal</label>{' '}
        </S.ItemLabelRequired>
        <Input type="text" name="authentication.principal" />
        <FormError>
          <ErrorMessage
            errors={methods.formState.errors}
            name="authentication.principal"
          />
        </FormError>
      </S.PartStyled>
    </>
  );
};
export default SaslGssapi;
