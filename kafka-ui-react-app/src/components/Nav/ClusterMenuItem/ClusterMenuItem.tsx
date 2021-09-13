import StyledMenuItem from 'components/Nav/ClusterMenuItem/ClusterMenuItem.styled';
import React from 'react';
import { NavLink } from 'react-router-dom';

export interface MenuItemProps {
  liType: 'primary';
  to?: string;
  activeClassName?: string;
  title?: string;
  isInverted?: boolean;
  isActive?: (match: unknown, location: Location) => boolean;
}

const ClusterMenuItem: React.FC<MenuItemProps> = (props) => {
  const { to, activeClassName, title, children, liType, isActive, ...rest } =
    props;

  if (to) {
    return (
      <StyledMenuItem to={to} liType={liType}>
        <NavLink
          to={to}
          activeClassName={activeClassName}
          title={title}
          {...rest}
        >
          {children || title}
        </NavLink>
      </StyledMenuItem>
    );
  }

  return <StyledMenuItem {...props} />;
};

export default ClusterMenuItem;
