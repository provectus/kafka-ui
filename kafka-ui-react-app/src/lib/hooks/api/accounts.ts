import { usersApiClient as api, rolesApiClient } from 'lib/api';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { showSuccessAlert } from 'lib/errorHandling';
import { CreateUser, UpdateUser } from 'generated-sources';

const ACCOUNTS_QUERY_KEY = ['accounts'];
const ROLES_QUERY_KEY = ['roles'];

export function useAccounts() {
  return useQuery(ACCOUNTS_QUERY_KEY, () => api.listUsers(), {
    suspense: false,
  });
}

export function useRoles() {
  return useQuery(ROLES_QUERY_KEY, () => rolesApiClient.listRoles(), {
    suspense: false,
  });
}

export function useCreateAccountMutation() {
  const queryClient = useQueryClient();
  return useMutation(
    (createUser: CreateUser) => api.createUser({ createUser }),
    {
      onSuccess: () => {
        showSuccessAlert({ message: 'Account created successfully' });
        queryClient.invalidateQueries(ACCOUNTS_QUERY_KEY);
      },
    }
  );
}

export function useUpdateAccountMutation(id: number) {
  const queryClient = useQueryClient();
  return useMutation(
    (updateUser: UpdateUser) => api.updateUser({ id, updateUser }),
    {
      onSuccess: () => {
        showSuccessAlert({ message: 'Account updated successfully' });
        queryClient.invalidateQueries(ACCOUNTS_QUERY_KEY);
      },
    }
  );
}

export function useDeleteAccountMutation() {
  const queryClient = useQueryClient();
  return useMutation((id: number) => api.deleteUser({ id }), {
    onSuccess: () => {
      showSuccessAlert({ message: 'Account deleted successfully' });
      queryClient.invalidateQueries(ACCOUNTS_QUERY_KEY);
    },
  });
}
