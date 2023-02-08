import React from 'react';
import Select from 'components/common/Select/Select';
import { useFormContext, Controller } from 'react-hook-form';
import { ErrorMessage } from '@hookform/error-message';
import { FormError } from 'components/common/Input/Input.styled';
import Input from 'components/common/Input/Input';
import { AUTH_OPTIONS, SECURITY_PROTOCOL_OPTIONS } from 'lib/constants';
import Heading from 'components/common/heading/Heading.styled';
import { InputLabel } from 'components/common/Input/InputLabel.styled';

import AuthenticationMethods from './AuthenticationMethods/AuthenticationMethods';

const Authentication: React.FC = () => {
  const {
    watch,
    control,
    formState: { errors },
    register,
    setValue,
  } = useFormContext();

  const securityProtocol = watch('securityProtocol');
  const authMethod = watch('authentication.method');

  const isSecurityProtocolDisabled = authMethod === 'mTLS';

  return (
    <>
      <Heading level={3}>Authentication</Heading>
      <div>
        <InputLabel htmlFor="securityProtocol">Security Protocol</InputLabel>
        <Controller
          control={control}
          name="securityProtocol"
          render={({ field: { name, onChange } }) => {
            return (
              <Select
                disabled={isSecurityProtocolDisabled}
                name={name}
                minWidth="270px"
                onChange={onChange}
                value={securityProtocol}
                options={SECURITY_PROTOCOL_OPTIONS}
              />
            );
          }}
        />
        <FormError>
          <ErrorMessage errors={errors} name="securityProtocol" />
        </FormError>
      </div>
      {securityProtocol === 'SASL_SSL' && (
        <>
          <div>
            <InputLabel htmlFor="authentication.truststoreFile">
              Truststore File Location
            </InputLabel>
            <p>
              <input
                {...register('authentication.sslTruststoreFile')}
                type="file"
              />
            </p>
            <FormError>
              <ErrorMessage
                errors={errors}
                name="authentication.sslTruststoreFile"
              />
            </FormError>
          </div>
          <div>
            <InputLabel htmlFor="saslPassword">Truststore Password</InputLabel>
            <Input type="password" name="saslPassword" />
            <FormError>
              <ErrorMessage errors={errors} name="saslPassword" />
            </FormError>
          </div>
        </>
      )}
      <div>
        <InputLabel htmlFor="authentication.method">
          Authentication Method *
        </InputLabel>
        <Controller
          control={control}
          name="authentication.method"
          render={({ field: { name, value } }) => {
            return (
              <Select
                name={name}
                minWidth="270px"
                onChange={(val) => {
                  setValue('securityProtocol', 'SASL_SSL');
                  setValue('authentication.method', val);
                }}
                value={value}
                options={AUTH_OPTIONS}
              />
            );
          }}
        />
        <FormError>
          <ErrorMessage errors={errors} name="authentication.method" />
        </FormError>
      </div>
      <AuthenticationMethods method={authMethod} />
    </>
  );
};

export default Authentication;
