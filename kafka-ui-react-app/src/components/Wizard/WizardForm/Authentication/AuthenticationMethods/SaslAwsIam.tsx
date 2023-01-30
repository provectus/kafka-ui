import { ErrorMessage } from '@hookform/error-message';
import React from 'react';
import { useFormContext } from 'react-hook-form';
import * as S from 'components/Wizard/WizardForm/WizardForm.styled';
import Input from 'components/common/Input/Input';
import { FormError } from 'components/common/Input/Input.styled';

const SaslAwsIam: React.FC = (): JSX.Element => {
  const methods = useFormContext();
  return (
    <S.PartStyled>
      <S.ItemLabel>
        <label htmlFor="authentication.awsProfileName">AWS Profile Name</label>{' '}
      </S.ItemLabel>
      <Input
        id="authentication.awsProfileName"
        type="text"
        name="authentication.awsProfileName"
      />
      <FormError>
        <ErrorMessage
          errors={methods.formState.errors}
          name="authentication.awsProfileName"
        />
      </FormError>
    </S.PartStyled>
  );
};
export default SaslAwsIam;
