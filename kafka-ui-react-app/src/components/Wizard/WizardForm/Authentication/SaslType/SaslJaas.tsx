import { ErrorMessage } from '@hookform/error-message';
import React from 'react';
import { useFormContext } from 'react-hook-form';
import * as S from 'components/Wizard/WizardForm/WizardForm.styled';
import Input from 'components/common/Input/Input';
import { FormError } from 'components/common/Input/Input.styled';

const SaslJaas: React.FC = (): JSX.Element => {
  const methods = useFormContext();
  return (
    <>
      <S.PartStyled>
        <S.ItemLabelRequired>
          <label htmlFor="sasl.jaas.config">sasl.jaas.config</label>{' '}
        </S.ItemLabelRequired>
        <Input type="text" name="sasl.jaas.config" />
        <FormError>
          <ErrorMessage
            errors={methods.formState.errors}
            name="sasl.jaas.config"
          />
        </FormError>
      </S.PartStyled>
      <S.PartStyled>
        <S.ItemLabelRequired>
          <label htmlFor="sasl.enabled.mechanisms">
            sasl.enabled.mechanisms
          </label>{' '}
        </S.ItemLabelRequired>
        <Input type="text" name="sasl.enabled.mechanisms" />
        <FormError>
          <ErrorMessage
            errors={methods.formState.errors}
            name="sasl.enabled.mechanisms"
          />
        </FormError>
      </S.PartStyled>
    </>
  );
};
export default SaslJaas;
