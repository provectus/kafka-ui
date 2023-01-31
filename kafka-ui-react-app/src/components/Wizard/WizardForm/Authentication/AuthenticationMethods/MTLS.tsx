import { ErrorMessage } from '@hookform/error-message';
import React from 'react';
import { useFormContext } from 'react-hook-form';
import * as S from 'components/Wizard/WizardForm/WizardForm.styled';
import Input from 'components/common/Input/Input';
import { FormError } from 'components/common/Input/Input.styled';

const MTLS: React.FC = (): JSX.Element => {
  const methods = useFormContext();
  const selfSignedCertificate = methods.watch('selfSignedCertificate');
  return (
    <>
      <S.PartStyled>
        <S.CheckboxWrapper>
          <input
            {...methods.register('selfSignedCertificate')}
            id="selfSignedCertificate"
            name="selfSignedCertificate"
            type="checkbox"
          />
          <label htmlFor="selfSignedCertificate">Self Signed Certificate</label>
          <FormError>
            <ErrorMessage
              errors={methods.formState.errors}
              name="selfSignedCertificate"
            />
          </FormError>
        </S.CheckboxWrapper>
      </S.PartStyled>
      {selfSignedCertificate && (
        <S.PartStyled>
          <S.FileWrapper>
            <label htmlFor="authentication.sslTruststoreLocation">
              ssl.truststore.location
            </label>
            <input
              {...methods.register('authentication.sslTruststoreLocation')}
              name="authentication.sslTruststoreLocation"
              type="file"
            />

            <FormError>
              <ErrorMessage
                errors={methods.formState.errors}
                name="authentication.sslTruststoreLocation"
              />
            </FormError>
          </S.FileWrapper>
        </S.PartStyled>
      )}
      <S.PartStyled>
        <S.ItemLabelRequired>
          <label htmlFor="authentication.sslTruststorePassword">
            ssl.truststore.password
          </label>{' '}
        </S.ItemLabelRequired>
        <Input
          id="authentication.sslTruststorePassword"
          type="password"
          name="authentication.sslTruststorePassword"
        />
        <FormError>
          <ErrorMessage
            errors={methods.formState.errors}
            name="authentication.sslTruststorePassword"
          />
        </FormError>
      </S.PartStyled>
      <S.PartStyled>
        <S.FileWrapper>
          <label htmlFor="authentication.sslKeystoreLocation">
            ssl.keystore.location
          </label>
          <input
            {...methods.register('authentication.sslKeystoreLocation')}
            name="authentication.sslKeystoreLocation"
            type="file"
          />

          <FormError>
            <ErrorMessage
              errors={methods.formState.errors}
              name="authentication.sslKeystoreLocation"
            />
          </FormError>
        </S.FileWrapper>
      </S.PartStyled>
      <S.PartStyled>
        <S.ItemLabelRequired>
          <label htmlFor="authentication.sslKeystorePassword">
            ssl.keystore.password
          </label>{' '}
        </S.ItemLabelRequired>
        <Input
          id="authentication.sslKeystorePassword"
          type="password"
          name="authentication.sslKeystorePassword"
        />
        <FormError>
          <ErrorMessage
            errors={methods.formState.errors}
            name="authentication.sslKeystorePassword"
          />
        </FormError>
      </S.PartStyled>
      <S.PartStyled>
        <S.ItemLabelRequired>
          <label htmlFor="authentication.sslKeyPassword">
            ssl.key.password
          </label>{' '}
        </S.ItemLabelRequired>
        <Input
          id="authentication.sslKeyPassword"
          type="password"
          name="authentication.sslKeyPassword"
        />
        <FormError>
          <ErrorMessage
            errors={methods.formState.errors}
            name="authentication.sslKeyPassword"
          />
        </FormError>
      </S.PartStyled>
    </>
  );
};
export default MTLS;
