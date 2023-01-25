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
        <label htmlFor="awsProfileName">AWS Profile Name</label>{' '}
      </S.ItemLabel>
      <Input type="text" name="awsProfileName" />
      <FormError>
        <ErrorMessage errors={methods.formState.errors} name="awsProfileName" />
      </FormError>
    </S.PartStyled>
  );
};
export default SaslAwsIam;
