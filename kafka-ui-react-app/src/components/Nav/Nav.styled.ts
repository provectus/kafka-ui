import { NavLink } from 'react-router-dom';
import styled, { css } from 'styled-components';

export const List = styled.ul.attrs({ role: 'menu' })`
  padding-bottom: 4px;

  & > & {
    padding-left: 8px;
  }
`;

export const Divider = styled.hr`
  margin: 0;
  height: 1px;
`;

export const Link = styled(NavLink).attrs({ activeClassName: 'is-active' })(
  ({ theme, activeClassName }) => css`
    width: 100%;
    padding: 0.5em 0.75em;
    cursor: pointer;
    text-decoration: none;
    margin: 0px 0px;
    background-color: ${theme.menuStyles.backgroundColor.normal};
    color: ${theme.menuStyles.color.normal};

    &:hover {
      background-color: ${theme.menuStyles.backgroundColor.hover};
      color: ${theme.menuStyles.color.hover};
    }

    &.${activeClassName} {
      background-color: ${theme.menuStyles.backgroundColor.active};
      color: ${theme.menuStyles.color.active};
    }
  `
);

export const ListItem = styled('li').attrs({ role: 'menuitem' })<{
  $isTopLevel?: boolean;
}>`
  font-size: 14px;
  font-weight: ${({ $isTopLevel }) => ($isTopLevel ? 500 : 'normal')};
  height: 32px;
  display: flex;
  user-select: none;
`;
