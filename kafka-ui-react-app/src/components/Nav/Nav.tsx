import { useClusters } from 'lib/hooks/api/clusters';
import React from 'react';
import styled, { css } from 'styled-components';
import { NavLink } from 'react-router-dom';

import ClusterMenu from './ClusterMenu';
import ClusterMenuItem from './ClusterMenuItem';
import * as S from './Nav.styled';

const clusters = false;
const ClustersLink = styled(NavLink)(
  ({ theme }) => css`
    width: 100%;
    padding: 0.5em 0.75em;
    cursor: pointer;
    text-decoration: none;
    margin: 0 0;
    background-color: ${theme.menu.backgroundColor.normal};
    color: ${theme.menu.color.normal};

    &:hover {
      background-color: ${theme.menu.backgroundColor.hover};
      color: ${theme.menu.color.hover};
    }
    &.active {
      background-color: ${theme.menu.backgroundColor.active};
      color: ${theme.menu.color.active};
    }
  `
);
const Nav: React.FC = () => {
  const query = useClusters();

  if (!query.isSuccess) {
    return null;
  }

  return (
    <aside aria-label="Sidebar Menu">
      {clusters ? (
        <ClustersLink to="/ui/clusters/local/wizard">Clusters</ClustersLink>
      ) : (
        <div>
          <S.List>
            <ClusterMenuItem to="/" title="Dashboard" isTopLevel />
          </S.List>
          {query?.data?.map((cluster) => (
            <ClusterMenu
              cluster={cluster}
              key={cluster.name}
              singleMode={query?.data?.length === 1}
            />
          ))}
        </div>
      )}
    </aside>
  );
};

export default Nav;
