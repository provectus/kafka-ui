import React from 'react';
import { Cluster } from 'generated-sources';

import ClusterMenu from './ClusterMenu';
import ClusterMenuItem from './ClusterMenuItem';
import * as S from './Nav.styled';

interface Props {
  areClustersFulfilled?: boolean;
  clusters: Cluster[];
}

const Nav: React.FC<Props> = ({ areClustersFulfilled, clusters }) => (
  <aside aria-label="Sidebar Menu">
    <S.List>
      <ClusterMenuItem exact to="/ui" title="Dashboard" isTopLevel />
    </S.List>

    {areClustersFulfilled &&
      clusters.map((cluster) => (
        <ClusterMenu
          cluster={cluster}
          key={cluster.name}
          singleMode={clusters.length === 1}
        />
      ))}
  </aside>
);

export default Nav;
