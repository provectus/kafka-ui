import { ErrorMessage } from '@hookform/error-message';
import React from 'react';
import { useFormContext } from 'react-hook-form';
import * as S from 'components/Wizard/WizardForm/WizardForm.styled';
import Input from 'components/common/Input/Input';
import { FormError } from 'components/common/Input/Input.styled';

const DelegationTokens: React.FC = (): JSX.Element => {
  const methods = useFormContext();
  return (
    <>
      <S.PartStyled>
        <S.ItemLabelRequired>
          <label htmlFor="token_id">Token Id</label>{' '}
        </S.ItemLabelRequired>
        <Input type="text" name="token_id" />
        <FormError>
          <ErrorMessage errors={methods.formState.errors} name="token_id" />
        </FormError>
      </S.PartStyled>
      <S.PartStyled>
        <S.ItemLabelRequired>
          <label htmlFor="token_value">Token Value</label>{' '}
        </S.ItemLabelRequired>
        <Input type="text" name="token_value" />
        <FormError>
          <ErrorMessage errors={methods.formState.errors} name="token_value" />
        </FormError>
      </S.PartStyled>
    </>
  );
};
export default DelegationTokens;
