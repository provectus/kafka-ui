import { styled } from 'lib/themedStyles';

import { MenuItemProps } from './ClusterMenuItem';

const StyledMenuItem = styled.li<MenuItemProps>`
  font-family: 'Inter', sans-serif;
  font-style: normal;
  font-weight: normal;
  font-size: 14px;

  ${(props) => {
    if (!props.to) return `padding: 0.5em 0.75em;`;

    const { theme, liType } = props;

    return `
      & a {
        padding: 0.5em 0.75em;
        cursor: pointer;
        text-decoration: none;
        margin: 0px 0px;
        line-height: 20px;
        background-color: ${theme.liStyles[liType].backgroundColor.normal};
        color: ${theme.liStyles[liType].color.normal};

        &.hover {
          background-color: ${theme.liStyles[liType].backgroundColor.hover};
          color: ${theme.liStyles[liType].color.hover};
        }
        &.is-active {
          background-color: ${theme.liStyles[liType].backgroundColor.active};
          color: ${theme.liStyles[liType].color.active};
        }
      }
    `;
  }}
`;

StyledMenuItem.displayName = 'StyledMenuItem';

export default StyledMenuItem;
