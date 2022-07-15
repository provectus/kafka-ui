import React, { PropsWithChildren } from 'react';

import * as S from './Nav.styled';

export interface ClusterMenuItemProps {
  to: string;
  title?: string;
  isTopLevel?: boolean;
}

const ClusterMenuItem: React.FC<PropsWithChildren<ClusterMenuItemProps>> = (
  props
) => {
  const { to, title, children, isTopLevel } = props;

  if (to) {
    return (
      <S.ListItem $isTopLevel={isTopLevel}>
        <S.Link to={to} title={title}>
          {title}
        </S.Link>
        {children}
      </S.ListItem>
    );
  }

  return <S.ListItem {...props} />;
};

export default ClusterMenuItem;
