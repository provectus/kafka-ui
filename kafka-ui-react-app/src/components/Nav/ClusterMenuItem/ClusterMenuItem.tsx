import StyledMenuItem from 'components/Nav/ClusterMenuItem/ClusterMenuItem.styled';
import React from 'react';
import { NavLink } from 'react-router-dom';

export interface MenuItemProps {
  to: string;
  activeClassName?: string;
  title?: string;
  isInverted?: boolean;
  exact?: boolean;
  isTopLevel?: boolean;
  isActive?: (match: unknown, location: Location) => boolean;
}

const ClusterMenuItem: React.FC<MenuItemProps> = (props) => {
  const {
    to,
    activeClassName,
    title,
    children,
    isActive,
    exact,
    isTopLevel,
    ...rest
  } = props;

  if (to) {
    return (
      <StyledMenuItem to={to} isTopLevel={isTopLevel}>
        <NavLink
          to={to}
          activeClassName={activeClassName}
          title={title}
          exact={exact}
          {...rest}
        >
          {title}
        </NavLink>
        {children}
      </StyledMenuItem>
    );
  }

  return <StyledMenuItem {...props} />;
};

export default ClusterMenuItem;
