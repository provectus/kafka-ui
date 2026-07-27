import { useClusters } from 'lib/hooks/api/clusters';
import { useGetUserInfo } from 'lib/hooks/api/roles';
import { ResourceType } from 'generated-sources';
import { accountsPath } from 'lib/paths';
import React from 'react';

import ClusterMenu from './ClusterMenu';
import ClusterMenuItem from './ClusterMenuItem';
import * as S from './Nav.styled';

const Nav: React.FC = () => {
  const clusters = useClusters();
  const { data: authInfo } = useGetUserInfo();

  const hasUsersPermission =
    !authInfo?.rbacEnabled ||
    !!authInfo?.userInfo?.permissions.some(
      (permission) => permission.resource === ResourceType.USERS
    );

  return (
    <aside aria-label="Sidebar Menu">
      <S.List>
        <ClusterMenuItem to="/" title="Dashboard" isTopLevel />
        {hasUsersPermission && (
          <ClusterMenuItem to={accountsPath} title="Accounts" isTopLevel />
        )}
      </S.List>
      {clusters.isSuccess &&
        clusters.data.map((cluster) => (
          <ClusterMenu
            cluster={cluster}
            key={cluster.name}
            singleMode={clusters.data.length === 1}
          />
        ))}
    </aside>
  );
};

export default Nav;
