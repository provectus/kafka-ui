import { useClusters } from 'lib/hooks/api/clusters';
import React from 'react';

import ClusterMenu from './ClusterMenu';
import ClusterMenuItem from './ClusterMenuItem';
import * as S from './Nav.styled';

const Nav: React.FC = () => {
  const clusters = useClusters();

  return (
    <aside aria-label="Sidebar Menu">
      <S.List>
        <ClusterMenuItem to="/" title="Dashboard" isTopLevel />
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
