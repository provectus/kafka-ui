import styled from 'styled-components';
import theme from 'theme/theme';

type IsActive = boolean;
type IsVisible = boolean;

export const Layout = styled.div`
  min-width: 1200px;

  @media screen and (max-width: 1023px) {
    min-width: initial;
  }
`;

export const Alerts = styled.div`
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

export const Container = styled.main`
  margin-top: ${theme.layout.navBarHeight};
  margin-left: ${theme.layout.navBarWidth};
  position: relative;
  z-index: 20;

  @media screen and (max-width: 1023px) {
    margin-left: initial;
    margin-top: 3.5rem;
  }
`;

export const Sidebar = styled.div<{ $isVisible: IsVisible }>`
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
    transform: ${({ $isVisible }) =>
      $isVisible ? `translate3d(${theme.layout.navBarWidth}, 0, 0)` : 'none'};
    left: -${theme.layout.navBarWidth};
    z-index: 100;
  }
`;

export const Overlay = styled.div<{ $isVisible: IsVisible }>`
  height: calc(100vh - ${theme.layout.navBarHeight});
  z-index: 99;
  display: block;
  visibility: 'hidden';
  opacity: 0;
  -webkit-transition: all 0.5s ease;
  transition: all 0.5s ease;
  bottom: 0;
  left: 0;
  position: absolute;
  right: 0;
  top: 0;

  @media screen and (max-width: 1023px) {
    visibility: ${({ $isVisible }) => ($isVisible ? 'visible' : 'hidden')};
    opacity: ${({ $isVisible }) => ($isVisible ? 1 : 0)};
    background-color: ${({ $isVisible }) =>
      $isVisible ? 'rgba(34, 41, 47, 0.5)' : 'transparent'};
  }
`;

export const Navbar = styled.nav`
  border-bottom: 1px solid #e7e7e7;
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 30;
  background-color: ${theme.menuStyles.backgroundColor.normal};
  min-height: 3.25rem;
`;

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

export const NavbarBurger = styled.div`
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
`;

export const Span = styled.span`
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
`;

export const Hyperlink = styled.a`
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
`;
