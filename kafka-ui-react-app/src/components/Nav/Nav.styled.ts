import { NavLink } from 'react-router-dom';
import styled, { css } from 'styled-components';

export const List = styled.ul.attrs({ role: 'menu' })`
  padding-bottom: 4px;

  & > & {
    padding-left: 8px;
  }
`;

export const Link = styled(NavLink)(
  ({ theme }) => css`
    width: 100%;
    padding: 0.5em 0.75em;
    cursor: pointer;
    text-decoration: none;
    margin: 0 0;
    background-color: ${theme.menu.backgroundColor.normal};
    color: ${theme.menu.color.normal};

    &:hover {
      background-color: ${theme.menu.backgroundColor.hover};
      color: ${theme.menu.color.hover};
    }
    &.active {
      background-color: ${theme.menu.backgroundColor.active};
      color: ${theme.menu.color.active};
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
