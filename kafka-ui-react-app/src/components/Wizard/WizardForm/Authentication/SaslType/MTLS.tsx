import { ErrorMessage } from '@hookform/error-message';
import React from 'react';
import { useFormContext } from 'react-hook-form';
import * as S from 'components/Wizard/WizardForm/WizardForm.styled';
import Input from 'components/common/Input/Input';
import { FormError } from 'components/common/Input/Input.styled';

const MTLS: React.FC = (): JSX.Element => {
  const methods = useFormContext();
  const selfSigned = methods.watch('selfSigned');
  return (
    <>
      {selfSigned && (
        <S.PartStyled>
          <S.FileWrapper>
            <label htmlFor="sslTruststoreLocation">
              ssl.truststore.location
            </label>
            <input
              {...methods.register('sslTruststoreLocation')}
              name="sslTruststoreLocation"
              type="file"
            />

            <FormError>
              <ErrorMessage
                errors={methods.formState.errors}
                name="sslTruststoreLocation"
              />
            </FormError>
          </S.FileWrapper>
        </S.PartStyled>
      )}
      <S.PartStyled>
        <S.ItemLabelRequired>
          <label htmlFor="sslTruststorePassword">ssl.truststore.password</label>{' '}
        </S.ItemLabelRequired>
        <Input type="password" name="sslTruststorePassword" />
        <FormError>
          <ErrorMessage
            errors={methods.formState.errors}
            name="sslTruststorePassword"
          />
        </FormError>
      </S.PartStyled>
      <S.PartStyled>
        <S.FileWrapper>
          <label htmlFor="sslKeystoreLocation">ssl.keystore.location</label>
          <input
            {...methods.register('sslKeystoreLocation')}
            name="sslKeystoreLocation"
            type="file"
          />

          <FormError>
            <ErrorMessage
              errors={methods.formState.errors}
              name="sslKeystoreLocation"
            />
          </FormError>
        </S.FileWrapper>
      </S.PartStyled>
      <S.PartStyled>
        <S.ItemLabelRequired>
          <label htmlFor="sslKeystorePassword">ssl.keystore.password</label>{' '}
        </S.ItemLabelRequired>
        <Input type="password" name="sslKeystorePassword" />
        <FormError>
          <ErrorMessage
            errors={methods.formState.errors}
            name="sslKeystorePassword"
          />
        </FormError>
      </S.PartStyled>
      <S.PartStyled>
        <S.ItemLabelRequired>
          <label htmlFor="sslKeyPassword">ssl.key.password</label>{' '}
        </S.ItemLabelRequired>
        <Input type="password" name="sslKeyPassword" />
        <FormError>
          <ErrorMessage
            errors={methods.formState.errors}
            name="sslKeyPassword"
          />
        </FormError>
      </S.PartStyled>
    </>
  );
};
export default MTLS;
