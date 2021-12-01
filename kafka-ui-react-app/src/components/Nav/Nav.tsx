import React from 'react';
import { Cluster } from 'generated-sources';

import ClusterMenu from './ClusterMenu';
import ClusterMenuItem from './ClusterMenuItem';
import * as S from './Nav.styled';

interface Props {
  isClusterListFetched?: boolean;
  clusters: Cluster[];
}

const Nav: React.FC<Props> = ({ isClusterListFetched, clusters }) => (
  <aside>
    <S.List>
      <ClusterMenuItem exact to="/ui" title="Dashboard" isTopLevel />
    </S.List>

    {isClusterListFetched &&
      clusters.map((cluster) => (
        <ClusterMenu cluster={cluster} key={cluster.name} />
      ))}
  </aside>
);

export default Nav;
