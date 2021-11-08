import styled from 'styled-components';

import { MenuItemProps } from './ClusterMenuItem';

const StyledMenuItem = styled.li<MenuItemProps>`
  font-size: 14px;
  font-weight: ${(props) => (props.isTopLevel ? 500 : 'normal')};
  height: 32px;
  display: flex;
  user-select: none;
  & a {
    width: 100%;
    padding: 0.5em 0.75em;
    cursor: pointer;
    text-decoration: none;
    margin: 0px 0px;
    background-color: ${(props) =>
      props.theme.menuStyles.backgroundColor.normal};
    color: ${(props) => props.theme.menuStyles.color.normal};

    &:hover {
      background-color: ${(props) =>
        props.theme.menuStyles.backgroundColor.hover};
      color: ${(props) => props.theme.menuStyles.color.hover};
    }
    &.is-active {
      background-color: ${(props) =>
        props.theme.menuStyles.backgroundColor.active};
      color: ${(props) => props.theme.menuStyles.color.active};
    }
  }
`;

StyledMenuItem.displayName = 'StyledMenuItem';

export default StyledMenuItem;
