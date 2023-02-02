import * as S from 'components/Wizard/WizardForm/WizardForm.styled';
import React from 'react';
import Select from 'components/common/Select/Select';
import { useFormContext, Controller } from 'react-hook-form';
import { ErrorMessage } from '@hookform/error-message';
import { FormError } from 'components/common/Input/Input.styled';
import Input from 'components/common/Input/Input';
import { AUTH_OPTIONS, SECURITY_PROTOCOL_OPTIONS } from 'lib/constants';

import AuthenticationMethods from './AuthenticationMethods/AuthenticationMethods';

const Authentication: React.FC = () => {
  const methods = useFormContext();
  const securityProtocol = methods.watch('securityProtocol');

  return (
    <S.Section>
      <S.SectionName>Authentication</S.SectionName>
      <div>
        <S.PartStyled>
          <S.ItemLabel>
            <label htmlFor="securityProtocol">Security Protocol</label>{' '}
          </S.ItemLabel>
          <Controller
            defaultValue={SECURITY_PROTOCOL_OPTIONS[0].value}
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
                  options={SECURITY_PROTOCOL_OPTIONS}
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
            defaultValue={AUTH_OPTIONS[0].value}
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
                  options={AUTH_OPTIONS}
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
