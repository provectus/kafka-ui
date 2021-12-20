import styled, { css } from 'styled-components';

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
    border-right: 1px solid #e7e7e7;
    position: fixed;
    top: ${theme.layout.navBarHeight};
    left: 0;
    bottom: 0;
    padding: 8px 16px;
    overflow-y: scroll;
    transition: width 0.25s, opacity 0.25s, transform 0.25s,
      -webkit-transform 0.25s;
    background: ${theme.menuStyles.backgroundColor.normal};
    @media screen and (max-width: 1023px) {
      ${$visible &&
      `transform: translate3d(${theme.layout.navBarWidth}, 0, 0)`};
      left: -${theme.layout.navBarWidth};
      z-index: 100;
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
        opacity: 1;
        background-color: rgba(34, 41, 47, 0.5);
      }
    `}
  `
);

export const Navbar = styled.nav(
  ({ theme }) => css`
    border-bottom: 1px solid #e7e7e7;
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    z-index: 30;
    background-color: ${theme.menuStyles.backgroundColor.normal};
    min-height: 3.25rem;
  `
);

export const NavbarBrand = styled.div`
  display: flex;
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
      background-color: ${theme.menuStyles.backgroundColor.hover};
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
    background: ${theme.menuStyles.color.active};
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

export const Hyperlink = styled.a(
  ({ theme }) => css`
    display: flex;
    position: relative;
    flex-grow: 0;
    flex-shrink: 0;
    align-items: center;
    margin: 0;
    color: ${theme.menuStyles.color.active};
    font-size: 1.25rem;
    font-weight: 600;
    cursor: pointer;
    line-height: 1.5;
    padding: 0.5rem 0.75rem;
    text-decoration: none;
    word-break: break-word;
  `
);

export const AlertsContainer = styled.div`
  max-width: 40%;
  width: 500px;
  position: fixed;
  bottom: 15px;
  left: 15px;
  z-index: 1000;

  @media screen and (max-width: 1023px) {
    max-width: initial;
  }
`;
