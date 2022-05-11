import React, { PropsWithChildren } from 'react';
import { NavLinkProps } from 'react-router-dom';

import * as S from './Nav.styled';

export interface ClusterMenuItemProps {
  to: string;
  title?: string;
  exact?: boolean;
  isTopLevel?: boolean;
  isActive?: NavLinkProps['isActive'];
}

const ClusterMenuItem: React.FC<PropsWithChildren<ClusterMenuItemProps>> = (
  props
) => {
  const { to, title, children, exact, isTopLevel, isActive } = props;

  if (to) {
    return (
      <S.ListItem $isTopLevel={isTopLevel}>
        <S.Link to={to} title={title} exact={exact} isActive={isActive}>
          {title}
        </S.Link>
        {children}
      </S.ListItem>
    );
  }

  return <S.ListItem {...props} />;
};

export default ClusterMenuItem;
