import { useContext } from 'react';
import { UserInfoRolesAccessContext } from 'components/contexts/UserInfoRolesAccessContext';

export function useUserInfo() {
  return useContext(UserInfoRolesAccessContext);
}
