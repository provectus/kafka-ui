import * as S from 'components/Wizard/WizardForm/WizardForm.styled';
import React from 'react';
import Select from 'components/common/Select/Select';
import { useFormContext, Controller } from 'react-hook-form';
import { IOption } from 'components/Wizard/WizardForm/WizardForm';
import { ErrorMessage } from '@hookform/error-message';
import { FormError } from 'components/common/Input/Input.styled';
import Input from 'components/common/Input/Input';

import AuthenticationMethods from './AuthenticationMethods/AuthenticationMethods';

type PropType = {
  options: IOption[];
  securityProtocolOptions: IOption[];
};
const Authentication: React.FC<PropType> = ({
  options,
  securityProtocolOptions,
}) => {
  const methods = useFormContext();
  const securityProtocol = methods.getValues('securityProtocol');

  return (
    <S.Section>
      <S.SectionName>Authentication</S.SectionName>
      <div>
        <S.PartStyled>
          <S.ItemLabelRequired>
            <label htmlFor="securityProtocol">Security Protocol</label>{' '}
          </S.ItemLabelRequired>
          <Controller
            defaultValue={securityProtocolOptions[0].value}
            control={methods.control}
            name="securityProtocol"
            render={({ field: { name, onChange, value } }) => {
              return (
                <Select
                  name={name}
                  placeholder="Select"
                  minWidth="270px"
                  onChange={onChange}
                  value={value}
                  options={securityProtocolOptions}
                />
              );
            }}
          />
          <FormError>
            <ErrorMessage errors={methods.formState.errors} name="password" />
          </FormError>
          {securityProtocol === 'sasl_ssl' && (
            <>
              <S.PartStyled>
                <S.CheckboxWrapper>
                  <input
                    {...methods.register('selfSigned')}
                    id="selfSigned"
                    name="selfSigned"
                    type="checkbox"
                  />
                  <label htmlFor="selfSigned">Self Signed</label>
                  <FormError>
                    <ErrorMessage
                      errors={methods.formState.errors}
                      name="selfSigned"
                    />
                  </FormError>
                </S.CheckboxWrapper>
              </S.PartStyled>
              <S.PartStyled>
                <S.FileWrapper>
                  <label htmlFor="truststoreFile">
                    Truststore File Location
                  </label>
                  <input
                    {...methods.register('truststoreFile')}
                    name="truststoreFile"
                    type="file"
                  />

                  <FormError>
                    <ErrorMessage
                      errors={methods.formState.errors}
                      name="truststoreFile"
                    />
                  </FormError>
                </S.FileWrapper>
              </S.PartStyled>
              <S.PartStyled>
                <label htmlFor="saslPassword">Password</label>{' '}
                <Input type="password" name="saslPassword" />
                <FormError>
                  <ErrorMessage
                    errors={methods.formState.errors}
                    name="saslPassword"
                  />
                </FormError>
              </S.PartStyled>
            </>
          )}
        </S.PartStyled>

        <S.PartStyled>
          <S.ItemLabelRequired>
            <label htmlFor="authentication.type">Authentication Method</label>{' '}
          </S.ItemLabelRequired>
          <Controller
            defaultValue={options[0].value}
            control={methods.control}
            name="authentication.type"
            render={({ field: { name, onChange, value } }) => {
              return (
                <Select
                  name={name}
                  placeholder="Select"
                  minWidth="270px"
                  onChange={(authenticationValue) => {
                    if (authenticationValue === 'mTLS') {
                      methods.setValue('securityProtocol', 'sasl_ssl');
                    }
                    onChange(authenticationValue);
                  }}
                  value={value}
                  options={options}
                />
              );
            }}
          />
          <FormError>
            <ErrorMessage
              errors={methods.formState.errors}
              name="authentication.type"
            />
          </FormError>
        </S.PartStyled>
        <S.PartStyled>
          <AuthenticationMethods />
        </S.PartStyled>
      </div>
    </S.Section>
  );
};

export default Authentication;
