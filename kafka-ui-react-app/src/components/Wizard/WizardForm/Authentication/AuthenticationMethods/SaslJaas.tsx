import { ErrorMessage } from '@hookform/error-message';
import React from 'react';
import { useFormContext } from 'react-hook-form';
import * as S from 'components/Wizard/WizardForm/WizardForm.styled';
import Input from 'components/common/Input/Input';
import { FormError } from 'components/common/Input/Input.styled';

const SaslJaas: React.FC = () => {
  const methods = useFormContext();
  return (
    <S.PartStyled>
      <S.ItemLabelRequired>
        <label htmlFor="authentication.saslJaasConfig">sasl.jaas.config</label>{' '}
      </S.ItemLabelRequired>
      <Input type="text" name="authentication.saslJaasConfig" />
      <FormError>
        <ErrorMessage
          errors={methods.formState.errors}
          name="authentication.saslJaasConfig"
        />
      </FormError>
    </S.PartStyled>
  );
};
export default SaslJaas;
