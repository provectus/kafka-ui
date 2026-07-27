import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { FormProvider, useForm } from 'react-hook-form';
import PageHeading from 'components/common/PageHeading/PageHeading';
import Input from 'components/common/Input/Input';
import { Button } from 'components/common/Button/Button';
import { InputLabel } from 'components/common/Input/InputLabel.styled';
import { StyledForm } from 'components/common/Form/Form.styled';
import Switch from 'components/common/Switch/Switch';
import {
  useAccounts,
  useRoles,
  useUpdateAccountMutation,
} from 'lib/hooks/api/accounts';
import { accountsPath } from 'lib/paths';

interface FormValues {
  password: string;
  enabled: boolean;
  roles: string[];
}

const Edit: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const accountId = Number(id);

  const { data: accounts } = useAccounts();
  const { data: roles } = useRoles();
  const account = accounts?.find((a) => a.id === accountId);
  const updateAccount = useUpdateAccountMutation(accountId);

  const methods = useForm<FormValues>({
    mode: 'onChange',
    values: {
      password: '',
      enabled: account?.enabled ?? true,
      roles: account?.roles ?? [],
    },
  });

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { isSubmitting },
  } = methods;

  const onSubmit = async (data: FormValues) => {
    try {
      await updateAccount.mutateAsync({
        password: data.password || undefined,
        enabled: data.enabled,
        roles: data.roles,
      });
      navigate(accountsPath);
    } catch (e) {
      // do nothing
    }
  };

  return (
    <>
      <PageHeading
        text="Edit Account"
        backText="Accounts"
        backTo={accountsPath}
      />
      <FormProvider {...methods}>
        <StyledForm onSubmit={handleSubmit(onSubmit)}>
          <div>
            <InputLabel>Username</InputLabel>
            <div>{account?.username}</div>
          </div>
          <div>
            <InputLabel>New Password (leave blank to keep current)</InputLabel>
            <Input
              name="password"
              type="password"
              autoComplete="new-password"
            />
          </div>
          <div>
            <InputLabel>Enabled</InputLabel>
            <Switch
              name="enabled"
              checked={watch('enabled')}
              onChange={() => setValue('enabled', !watch('enabled'))}
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
            disabled={isSubmitting}
          >
            Save
          </Button>
        </StyledForm>
      </FormProvider>
    </>
  );
};

export default Edit;
