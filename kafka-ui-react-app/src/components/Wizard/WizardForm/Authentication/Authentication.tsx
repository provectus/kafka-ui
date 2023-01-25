import * as S from 'components/Wizard/WizardForm/WizardForm.styled';
import React from 'react';
import Select from 'components/common/Select/Select';
import { useFormContext, Controller } from 'react-hook-form';
import { IOption } from 'components/Wizard/WizardForm/WizardForm';
import { ErrorMessage } from '@hookform/error-message';
import { FormError } from 'components/common/Input/Input.styled';
import Input from 'components/common/Input/Input';

import SaslType from './SaslType/SaslType';

type PropType = {
  getValue: (value: string, optionsType: IOption[]) => string | undefined;
  options: IOption[];
  securityProtocolOptions: IOption[];
};
const Authentication: React.FC<PropType> = ({
  getValue,
  options,
  securityProtocolOptions,
}) => {
  const methods = useFormContext();
  const securityProtocol = methods.watch('securityProtocol');
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
                  value={getValue(value, securityProtocolOptions)}
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
                  <label htmlFor="truststoreFile">Truststore File</label>
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
                <label htmlFor="location">Location</label>{' '}
                <Input type="text" name="location" />
                <FormError>
                  <ErrorMessage
                    errors={methods.formState.errors}
                    name="location"
                  />
                </FormError>
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
            <label htmlFor="saslType">SASL Type</label>{' '}
          </S.ItemLabelRequired>
          <Controller
            defaultValue={options[0].value}
            control={methods.control}
            name="saslType"
            render={({ field: { name, onChange, value } }) => {
              return (
                <Select
                  name={name}
                  placeholder="Select"
                  minWidth="270px"
                  onChange={onChange}
                  value={getValue(value, options)}
                  options={options}
                />
              );
            }}
          />
          <FormError>
            <ErrorMessage errors={methods.formState.errors} name="saslType" />
          </FormError>
        </S.PartStyled>
        <S.PartStyled>
          <SaslType />
        </S.PartStyled>
        {/* <S.CheckboxWrapper> */}
        {/*  <input */}
        {/*    {...methods.register('securedWithSSL')} */}
        {/*    name="securedWithSSL" */}
        {/*    type="checkbox" */}
        {/*  /> */}
        {/*  <label htmlFor="securedWithSSL">Secured with SSL</label> */}
        {/*  <FormError> */}
        {/*    <ErrorMessage */}
        {/*      errors={methods.formState.errors} */}
        {/*      name="securedWithSSL" */}
        {/*    /> */}
        {/*  </FormError> */}
        {/* </S.CheckboxWrapper> */}
        {/* {isSecuredWithSSL && ( */}
        {/*  <S.CheckboxWrapper> */}
        {/*    <input */}
        {/*      {...methods.register('selfSignedCertificate')} */}
        {/*      name="selfSignedCertificate" */}
        {/*      type="checkbox" */}
        {/*    /> */}
        {/*    <label htmlFor="selfSignedCertificate"> */}
        {/*      Self-signed certificate */}
        {/*    </label> */}
        {/*    <FormError> */}
        {/*      <ErrorMessage */}
        {/*        errors={methods.formState.errors} */}
        {/*        name="selfSignedCertificate" */}
        {/*      /> */}
        {/*    </FormError> */}
        {/*  </S.CheckboxWrapper> */}
        {/* )} */}
      </div>
    </S.Section>
  );
};

export default Authentication;
