import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FormProvider, useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import yup from 'lib/yupExtended';
import PageHeading from 'components/common/PageHeading/PageHeading';
import Input from 'components/common/Input/Input';
import { Button } from 'components/common/Button/Button';
import { InputLabel } from 'components/common/Input/InputLabel.styled';
import { StyledForm } from 'components/common/Form/Form.styled';
import { useRoles, useCreateAccountMutation } from 'lib/hooks/api/accounts';
import { accountsPath } from 'lib/paths';

interface FormValues {
  username: string;
  password: string;
  roles: string[];
}

const validationSchema = yup.object().shape({
  username: yup.string().trim().required(),
  password: yup.string().trim().required(),
});

const New: React.FC = () => {
  const navigate = useNavigate();
  const { data: roles } = useRoles();
  const createAccount = useCreateAccountMutation();

  const methods = useForm<FormValues>({
    mode: 'onChange',
    resolver: yupResolver(validationSchema),
    defaultValues: { username: '', password: '', roles: [] },
  });

  const {
    register,
    handleSubmit,
    formState: { isSubmitting, isValid },
  } = methods;

  const onSubmit = async (data: FormValues) => {
    try {
      await createAccount.mutateAsync(data);
      navigate(accountsPath);
    } catch (e) {
      // do nothing
    }
  };

  return (
    <>
      <PageHeading
        text="Create Account"
        backText="Accounts"
        backTo={accountsPath}
      />
      <FormProvider {...methods}>
        <StyledForm onSubmit={handleSubmit(onSubmit)}>
          <div>
            <InputLabel>Username *</InputLabel>
            <Input name="username" type="text" autoComplete="off" />
          </div>
          <div>
            <InputLabel>Password *</InputLabel>
            <Input
              name="password"
              type="password"
              autoComplete="new-password"
            />
          </div>
          <div>
            <InputLabel>Roles</InputLabel>
            {roles?.map((role) => (
              <div key={role}>
                <label htmlFor={`role-${role}`}>
                  <input
                    id={`role-${role}`}
                    type="checkbox"
                    value={role}
                    {...register('roles')}
                  />{' '}
                  {role}
                </label>
              </div>
            ))}
          </div>
          <Button
            buttonType="primary"
            buttonSize="M"
            type="submit"
            disabled={!isValid || isSubmitting}
          >
            Create
          </Button>
        </StyledForm>
      </FormProvider>
    </>
  );
};

export default New;
