import styled, { css } from 'styled-components';
import { Link } from 'react-router-dom';

import { Button } from './common/Button/Button';

export const Layout = styled.div`
  min-width: 1200px;

  @media screen and (max-width: 1023px) {
    min-width: initial;
  }
`;

export const Container = styled.main(
  ({ theme }) => css`
    margin-top: ${theme.layout.navBarHeight};
    margin-left: ${theme.layout.navBarWidth};
    position: relative;
    padding-bottom: 30px;
    z-index: 20;

    @media screen and (max-width: 1023px) {
      margin-left: initial;
    }
  `
);

export const Sidebar = styled.div<{ $visible: boolean }>(
  ({ theme, $visible }) => css`
    width: ${theme.layout.navBarWidth};
    display: flex;
    flex-direction: column;
    border-right: 1px solid ${theme.layout.stuffBorderColor};
    position: fixed;
    top: ${theme.layout.navBarHeight};
    left: 0;
    bottom: 0;
    padding: 8px 16px;
    overflow-y: scroll;
    transition: width 0.25s, opacity 0.25s, transform 0.25s,
      -webkit-transform 0.25s;
    background: ${theme.menu.backgroundColor.normal};
    @media screen and (max-width: 1023px) {
      ${$visible &&
      `transform: translate3d(${theme.layout.navBarWidth}, 0, 0)`};
      left: -${theme.layout.navBarWidth};
      z-index: 100;
    }

    &::-webkit-scrollbar {
      width: 8px;
    }

    &::-webkit-scrollbar-track {
      background-color: ${theme.scrollbar.trackColor.normal};
    }

    &::-webkit-scrollbar-thumb {
      width: 8px;
      background-color: ${theme.scrollbar.thumbColor.normal};
      border-radius: 4px;
    }

    &:hover::-webkit-scrollbar-thumb {
      background: ${theme.scrollbar.thumbColor.active};
    }

    &:hover::-webkit-scrollbar-track {
      background-color: ${theme.scrollbar.trackColor.active};
    }
  `
);

export const Overlay = styled.div<{ $visible: boolean }>(
  ({ theme, $visible }) => css`
    height: calc(100vh - ${theme.layout.navBarHeight});
    z-index: 99;
    visibility: 'hidden';
    opacity: 0;
    -webkit-transition: all 0.5s ease;
    transition: all 0.5s ease;
    left: 0;
    position: absolute;
    top: 0;
    ${$visible &&
    css`
      @media screen and (max-width: 1023px) {
        bottom: 0;
        right: 0;
        visibility: 'visible';
        opacity: 0.7;
        background-color: ${theme.layout.overlay.backgroundColor};
      }
    `}
  `
);

export const Navbar = styled.nav(
  ({ theme }) => css`
    border-bottom: 1px solid ${theme.layout.stuffBorderColor};
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    z-index: 30;
    background-color: ${theme.menu.backgroundColor.normal};
    min-height: 3.25rem;
  `
);

export const NavbarBrand = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center !important;
  flex-shrink: 0;
  align-items: stretch;
  min-height: 3.25rem;
`;

export const NavbarItem = styled.div`
  display: flex;
  position: relative;
  flex-grow: 0;
  flex-shrink: 0;
  align-items: center;
  line-height: 1.5;
  padding: 0.5rem 0.75rem;
`;

export const NavbarBurger = styled.div(
  ({ theme }) => css`
    display: block;
    position: relative;
    cursor: pointer;
    height: 3.25rem;
    width: 3.25rem;
    margin: 0;
    padding: 0;

    &:hover {
      background-color: ${theme.menu.backgroundColor.hover};
    }

    @media screen and (min-width: 1024px) {
      display: none;
    }
  `
);

export const Span = styled.span(
  ({ theme }) => css`
    display: block;
    position: absolute;
    background: ${theme.menu.color.active};
    height: 1px;
    left: calc(50% - 8px);
    transform-origin: center;
    transition-duration: 86ms;
    transition-property: background-color, opacity, transform, -webkit-transform;
    transition-timing-function: ease-out;
    width: 16px;

    &:first-child {
      top: calc(50% - 6px);
    }
    &:nth-child(2) {
      top: calc(50% - 1px);
    }
    &:nth-child(3) {
      top: calc(50% + 4px);
    }
  `
);

export const Hyperlink = styled(Link)(
  ({ theme }) => css`
    position: relative;

    display: flex;
    flex-grow: 0;
    flex-shrink: 0;
    align-items: center;
    gap: 8px;

    margin: 0;
    padding: 0.5rem 0.75rem;

    font-family: Inter, sans-serif;
    font-style: normal;
    font-weight: bold;
    font-size: 12px;
    line-height: 16px;
    color: ${theme.menu.color.active};
    text-decoration: none;
    word-break: break-word;
    cursor: pointer;
  `
);

export const AlertsContainer = styled.div`
  max-width: 40%;
  width: 500px;
  position: fixed;
  bottom: 15px;
  right: 15px;
  z-index: 1000;

  @media screen and (max-width: 1023px) {
    max-width: initial;
  }
`;

export const LogoutButton = styled(Button)(
  ({ theme }) => css`
    color: ${theme.button.primary.invertedColors.normal};
    background: none !important;
    padding: 0 8px;
  `
);

export const LogoutLink = styled(Link)(
  () => css`
    margin-right: 16px;
  `
);
