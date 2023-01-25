import { ErrorMessage } from '@hookform/error-message';
import React from 'react';
import { useFormContext } from 'react-hook-form';
import * as S from 'components/Wizard/WizardForm/WizardForm.styled';
import Input from 'components/common/Input/Input';
import { FormError } from 'components/common/Input/Input.styled';

const SaslGssapi: React.FC = (): JSX.Element => {
  const methods = useFormContext();
  const usekeytab = methods.watch('usekeytab');
  return (
    <>
      <S.PartStyled>
        <S.ItemLabelRequired>
          <label htmlFor="sasl.kerberos.service.name">
            Kerberos service name
          </label>{' '}
        </S.ItemLabelRequired>
        <Input type="text" name="sasl.kerberos.service.name" />
        <FormError>
          <ErrorMessage
            errors={methods.formState.errors}
            name="sasl.kerberos.service.name"
          />
        </FormError>
      </S.PartStyled>
      <S.PartStyled>
        <S.CheckboxWrapper>
          <input
            {...methods.register('usekeytab')}
            name="usekeytab"
            type="checkbox"
          />
          <label htmlFor="usekeytab">Use Key Tab</label>
          <FormError>
            <ErrorMessage errors={methods.formState.errors} name="usekeytab" />
          </FormError>
        </S.CheckboxWrapper>
      </S.PartStyled>
      <S.PartStyled>
        <S.CheckboxWrapper>
          <input
            {...methods.register('storeKey')}
            name="storeKey"
            type="checkbox"
          />
          <label htmlFor="storeKey">Store Key</label>
          <FormError>
            <ErrorMessage errors={methods.formState.errors} name="storeKey" />
          </FormError>
        </S.CheckboxWrapper>
      </S.PartStyled>
      {usekeytab && (
        <S.PartStyled>
          <S.FileWrapper>
            <label htmlFor="keyTab">Key Tab</label>
            <input {...methods.register('keyTab')} name="keyTab" type="file" />

            <FormError>
              <ErrorMessage errors={methods.formState.errors} name="keyTab" />
            </FormError>
          </S.FileWrapper>
        </S.PartStyled>
      )}
      <S.PartStyled>
        <S.ItemLabelRequired>
          <label htmlFor="principal">Principal</label>{' '}
        </S.ItemLabelRequired>
        <Input type="text" name="principal" />
        <FormError>
          <ErrorMessage errors={methods.formState.errors} name="principal" />
        </FormError>
      </S.PartStyled>
    </>
  );
};
export default SaslGssapi;
