import { ErrorMessage } from '@hookform/error-message';
import React from 'react';
import { useFormContext } from 'react-hook-form';
import * as S from 'components/Wizard/WizardForm/WizardForm.styled';
import Input from 'components/common/Input/Input';
import { FormError } from 'components/common/Input/Input.styled';

const SaslOauthbearer: React.FC = (): JSX.Element => {
  const methods = useFormContext();
  return (
    <S.PartStyled>
      <S.ItemLabelRequired>
        <label htmlFor="unsecuredLoginStringClaim_sub">
          Unsecured Login String Claim_sub
        </label>{' '}
      </S.ItemLabelRequired>
      <Input type="text" name="unsecuredLoginStringClaim_sub" />
      <FormError>
        <ErrorMessage
          errors={methods.formState.errors}
          name="unsecuredLoginStringClaim_sub"
        />
      </FormError>
    </S.PartStyled>
  );
};
export default SaslOauthbearer;
