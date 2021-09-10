import StyledMenuItem, {
  Props as MenuItemProps,
} from 'components/Nav/ClusterMenuItem/ClusterMenuItem.styled';
import React from 'react';
import { NavLink } from 'react-router-dom';

export type Props = MenuItemProps;

const ClusterMenuItem: React.FC<Props> = (props) => {
  const { to, activeClassName, title, children, liType, ...rest } = props;

  if (to) {
    return (
      <StyledMenuItem liType={liType} {...rest}>
        <NavLink to={to} activeClassName={activeClassName} title={title}>
          {children}
        </NavLink>
      </StyledMenuItem>
    );
  }

  return <StyledMenuItem {...props} />;
};

export default ClusterMenuItem;
