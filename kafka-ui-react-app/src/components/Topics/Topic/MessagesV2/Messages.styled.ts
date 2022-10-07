import styled, { css } from 'styled-components';

export const Wrapper = styled.div(
  ({ theme }) => css`
    display: grid;
    grid-template-columns: 300px 1fr;
    justify-items: center;
    min-height: calc(
      100vh - ${theme.layout.navBarHeight} - ${theme.pageHeading.height} -
        ${theme.primaryTab.height}
    );
  `
);

export const Sidebar = styled.div(
  ({ theme }) => css`
    width: ${theme.layout.filtersSidebarWidth};
    position: sticky;
    top: ${theme.layout.navBarHeight};
    align-self: start;
  `
);

export const SidebarContent = styled.div`
  padding: 8px 16px 16px;
`;

export const TableWrapper = styled.div(
  ({ theme }) => css`
    width: calc(
      100vw - ${theme.layout.navBarWidth} - ${theme.layout.filtersSidebarWidth}
    );
    border-left: 1px solid ${theme.layout.stuffBorderColor};
  `
);

export const Pagination = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
  position: fixed;
  bottom: 0;
  padding: 16px;
  width: 300px;
`;

export const StatusBarWrapper = styled.div(
  ({ theme }) => css`
    padding: 4px 8px;
    position: sticky;
    top: ${theme.layout.navBarHeight};
    background-color: ${theme.layout.backgroundColor};
    border-bottom: 1px solid ${theme.layout.stuffBorderColor};
    white-space: nowrap;
    display: flex;
    justify-content: space-between;
    z-index: 10;
  `
);

export const StatusTags = styled.div`
  display: flex;
  gap: 4px;
`;
