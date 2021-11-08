import React from 'react';
import cx from 'classnames';
import { Cluster } from 'generated-sources';
import styled from 'styled-components';

import ClusterMenu from './ClusterMenu';
import ClusterMenuItem from './ClusterMenuItem/ClusterMenuItem';

interface Props {
  isClusterListFetched?: boolean;
  clusters: Cluster[];
  className?: string;
}

const Nav: React.FC<Props> = ({
  isClusterListFetched,
  clusters,
  className,
}) => (
  <aside className={cx('has-shadow has-background-white', className)}>
    <ul>
      <ClusterMenuItem
        exact
        to="/ui"
        activeClassName="is-active"
        title="Dashboard"
        isTopLevel
      />
    </ul>
    {!isClusterListFetched && <div className="loader" />}

    {isClusterListFetched &&
      clusters.map((cluster) => (
        <ClusterMenu cluster={cluster} key={cluster.name} />
      ))}
  </aside>
);

export default styled(Nav)`
  > * {
    padding-bottom: 4px;
  }
`;
