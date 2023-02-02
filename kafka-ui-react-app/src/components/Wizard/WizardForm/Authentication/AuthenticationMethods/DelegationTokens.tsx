import { ErrorMessage } from '@hookform/error-message';
import React from 'react';
import { useFormContext } from 'react-hook-form';
import * as S from 'components/Wizard/WizardForm/WizardForm.styled';
import Input from 'components/common/Input/Input';
import { FormError } from 'components/common/Input/Input.styled';

const DelegationTokens: React.FC = () => {
  const methods = useFormContext();
  return (
    <>
      <S.PartStyled>
        <S.ItemLabelRequired>
          <label htmlFor="authentication.tokenId">Token Id</label>{' '}
        </S.ItemLabelRequired>
        <Input
          id="authentication.tokenId"
          type="text"
          name="authentication.tokenId"
        />
        <FormError>
          <ErrorMessage
            errors={methods.formState.errors}
            name="authentication.tokenId"
          />
        </FormError>
      </S.PartStyled>
      <S.PartStyled>
        <S.ItemLabelRequired>
          <label htmlFor="authentication.tokenValue">Token Value</label>{' '}
        </S.ItemLabelRequired>
        <Input
          id="authentication.tokenValue"
          type="text"
          name="authentication.tokenValue"
        />
        <FormError>
          <ErrorMessage
            errors={methods.formState.errors}
            name="authentication.tokenValue"
          />
        </FormError>
      </S.PartStyled>
    </>
  );
};
export default DelegationTokens;
