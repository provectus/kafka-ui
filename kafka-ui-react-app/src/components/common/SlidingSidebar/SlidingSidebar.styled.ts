import styled from 'styled-components';

export const Wrapper = styled.div<{ $open?: boolean }>(
  ({ theme, $open }) => `
  background-color: ${theme.default.backgroundColor};
  position: fixed;
  top: ${theme.layout.navBarHeight};
  bottom: 0;
  width: 37vw;
  right: calc(${$open ? '0px' : theme.layout.rightSidebarWidth} * -1);
  box-shadow: -1px 0px 10px 0px rgba(0, 0, 0, 0.2);
  transition: right 0.3s linear;
  z-index: 200;

  h3 {
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-bottom: 1px solid ${theme.layout.stuffBorderColor};
    padding: 16px;
  }
`
);

export const Content = styled.div<{ $open?: boolean }>(
  ({ theme }) => `
  background-color: ${theme.default.backgroundColor};
  overflow-y: auto;
  position: absolute;
  top: 65px;
  bottom: 16px;
  left: 0;
  right: 0;
  padding: 16px;
`
);
