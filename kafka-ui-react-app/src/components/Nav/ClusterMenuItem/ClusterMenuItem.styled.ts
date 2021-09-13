import styled from 'styled-components';

import { MenuItemProps } from './ClusterMenuItem';

const StyledMenuItem = styled.li<MenuItemProps>`
  font-family: 'Inter', sans-serif;
  font-style: normal;
  font-weight: normal;
  font-size: 14px;

  ${({ to, theme, liType }) =>
    to
      ? `
        & a {
          padding: 0.5em 0.75em;
          cursor: pointer;
          text-decoration: none;
          margin: 0px 0px;
          line-height: 20px;
          background-color: ${theme.liStyles[liType].backgroundColor.normal};
          color: ${theme.liStyles[liType].color.normal};

          &.is-active {
            background-color: ${theme.liStyles[liType].backgroundColor.active};
            color: ${theme.liStyles[liType].color.active};
          }
        }
    `
      : `padding: 0.5em 0.75em;`}
`;

StyledMenuItem.displayName = 'StyledMenuItem';

export default StyledMenuItem;
