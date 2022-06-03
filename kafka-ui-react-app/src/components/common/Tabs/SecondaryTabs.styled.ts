import styled, { css } from 'styled-components';

export const Tab = styled.button<{ $active?: boolean }>(
  ({ theme, $active }) => css`
    background-color: ${theme.secondaryTab.backgroundColor[
      $active ? 'active' : 'normal'
    ]};
    color: ${theme.secondaryTab.color[$active ? 'active' : 'normal']};
    padding: 6px 16px;
    height: 32px;
    border: 1px solid ${theme.layout.stuffBorderColor};
    cursor: pointer;
    &:hover {
      background-color: ${theme.secondaryTab.backgroundColor.hover};
      color: ${theme.secondaryTab.color.hover};
    }
    &:first-child {
      border-radius: 4px 0 0 4px;
    }
    &:last-child {
      border-radius: 0 4px 4px 0;
    }
    &:not(:last-child) {
      border-right: 0px;
    }
  `
);

export const Tabs = styled.nav``;
