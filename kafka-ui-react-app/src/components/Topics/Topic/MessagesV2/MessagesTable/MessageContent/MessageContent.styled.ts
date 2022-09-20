import styled, { css } from 'styled-components';
import * as SEditorViewer from 'components/common/EditorViewer/EditorViewer.styled';

export const Section = styled.div`
  display: grid;
  grid-template-columns: 1fr 400px;
  align-items: stretch;
`;

export const ContentBox = styled.div`
  background-color: white;
  border-right: 1px solid ${({ theme }) => theme.layout.stuffBorderColor};
  display: flex;
  flex-direction: column;
  padding-right: 16px;
  & nav {
    padding-bottom: 16px;
  }

  ${SEditorViewer.Wrapper} {
    flex-grow: 1;
  }
`;

export const MetadataWrapper = styled.div`
  padding-left: 16px;
`;

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
