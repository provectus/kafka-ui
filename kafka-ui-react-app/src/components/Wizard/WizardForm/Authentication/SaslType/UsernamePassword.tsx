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
          <label htmlFor="username">Username</label>{' '}
        </S.ItemLabelRequired>
        <Input type="text" name="username" />
        <FormError>
          <ErrorMessage errors={methods.formState.errors} name="username" />
        </FormError>
      </S.PartStyled>
      <S.PartStyled>
        <S.ItemLabelRequired>
          <label htmlFor="password">Password</label>{' '}
        </S.ItemLabelRequired>
        <Input type="password" name="password" />
        <FormError>
          <ErrorMessage errors={methods.formState.errors} name="password" />
        </FormError>
      </S.PartStyled>
    </>
  );
};
export default UsernamePassword;
