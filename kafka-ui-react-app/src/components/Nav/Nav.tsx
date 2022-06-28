import useClusters from 'lib/hooks/api/useClusters';
import React from 'react';

import ClusterMenu from './ClusterMenu';
import ClusterMenuItem from './ClusterMenuItem';
import * as S from './Nav.styled';

const Nav: React.FC = () => {
  const query = useClusters();

  if (!query.isSuccess) {
    return null;
  }

  return (
    <aside aria-label="Sidebar Menu">
      <S.List>
        <ClusterMenuItem to="/" title="Dashboard" isTopLevel />
      </S.List>
      {query.data.map((cluster) => (
        <ClusterMenu
          cluster={cluster}
          key={cluster.name}
          singleMode={query.data.length === 1}
        />
      ))}
    </aside>
  );
};

export default Nav;
