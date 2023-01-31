import { ErrorMessage } from '@hookform/error-message';
import React from 'react';
import { useFormContext } from 'react-hook-form';
import * as S from 'components/Wizard/WizardForm/WizardForm.styled';
import Input from 'components/common/Input/Input';
import { FormError } from 'components/common/Input/Input.styled';

const UsernamePassword: React.FC = (): JSX.Element => {
  const methods = useFormContext();
  return (
    <>
      <S.PartStyled>
        <S.ItemLabelRequired>
          <label htmlFor="authentication.username">Username</label>{' '}
        </S.ItemLabelRequired>
        <Input
          id="authentication.username"
          type="text"
          name="authentication.username"
        />
        <FormError>
          <ErrorMessage
            errors={methods.formState.errors}
            name="authentication.username"
          />
        </FormError>
      </S.PartStyled>
      <S.PartStyled>
        <S.ItemLabelRequired>
          <label htmlFor="authentication.password">Password</label>{' '}
        </S.ItemLabelRequired>
        <Input
          id="authentication.username"
          type="authentication.password"
          name="authentication.password"
        />
        <FormError>
          <ErrorMessage
            errors={methods.formState.errors}
            name="authentication.password"
          />
        </FormError>
      </S.PartStyled>
    </>
  );
};
export default UsernamePassword;
