import styled from 'styled-components';

import { MenuItemProps } from './ClusterMenuItem';

const StyledMenuItem = styled.li<MenuItemProps>`
  a {
    cursor: pointer;
    text-decoration: none;
    margin: 0px 0px;
    font-family: 'Inter', sans-serif;
    font-style: normal;
    font-weight: normal;
    font-size: 14px;
    line-height: 20px;
    background-color: ${(props) =>
      props.theme.liStyles[props.liType].backgroundColor.normal};
    color: ${(props) => props.theme.liStyles[props.liType].color.normal};

    &.is-active {
      background-color: ${(props) =>
        props.theme.liStyles[props.liType].backgroundColor.active};
      color: ${(props) => props.theme.liStyles[props.liType].color.active};
    }
  }
`;

StyledMenuItem.displayName = 'StyledMenuItem';

export default StyledMenuItem;
