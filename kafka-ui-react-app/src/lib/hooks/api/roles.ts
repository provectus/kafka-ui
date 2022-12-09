import { useQuery } from '@tanstack/react-query';
import { AccessApiClient } from 'lib/api';
import { QUERY_REFETCH_OFF_OPTIONS } from 'lib/constants';
import { CanCreateResourceRequest } from 'generated-sources';
import { showAlert } from 'lib/errorHandling';

export function canCreateResource(payload: CanCreateResourceRequest) {
  return AccessApiClient.canCreateResource(payload);
}

export async function canCreateResourceWithAlert(
  payload: CanCreateResourceRequest
) {
  try {
    const can = await canCreateResource(payload);
    if (!can) {
      showAlert('error', {
        title: 'Permission',
        message: `You Don't have the permission to Create "${payload.resourceName}"`,
      });
      return false;
    }

    return true;
  } catch (e) {
    showAlert('error', {
      title: 'Permission',
      message: `You Don't have the permission to Create "${payload.resourceName}"`,
    });
    return false;
  }
}

export function useGetUserInfo() {
  return useQuery(
    ['userInfo'],
    () => AccessApiClient.getUserAuthInfo(),
    QUERY_REFETCH_OFF_OPTIONS
  );
}
