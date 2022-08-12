import styled, { css } from 'styled-components';
import * as SEditorViewer from 'components/common/EditorViewer/EditorViewer.styled';

export const Wrapper = styled.tr`
  background-color: ${({ theme }) => theme.topicMetaData.backgroundColor};
  & > td {
    padding: 16px;
    &:first-child {
      padding-right: 1px;
    }
    &:last-child {
      padding-left: 1px;
    }
  }
`;

export const Section = styled.div`
  padding: 0 16px;
  display: flex;
  gap: 1px;
  align-items: stretch;
`;

export const ContentBox = styled.div`
  background-color: white;
  padding: 24px;
  border-radius: 8px 0 0 8px;
  flex-grow: 3;
  display: flex;
  flex-direction: column;
  & nav {
    padding-bottom: 16px;
  }

  ${SEditorViewer.Wrapper} {
    flex-grow: 1;
  }
`;

export const MetadataWrapper = styled.div`
  background-color: white;
  padding: 24px;
  border-radius: 0 8px 8px 0;
  flex-grow: 1;
  display: flex;
  flex-direction: column;
  gap: 16px;
  min-width: 400px;
`;

export const Metadata = styled.span`
  display: flex;
  gap: 35px;
`;

export const MetadataLabel = styled.p`
  color: ${({ theme }) => theme.topicMetaData.color.label};
  font-size: 14px;
  width: 80px;
`;

export const MetadataValue = styled.p`
  color: ${({ theme }) => theme.topicMetaData.color.value};
  font-size: 14px;
`;

export const MetadataMeta = styled.p`
  color: ${({ theme }) => theme.topicMetaData.color.meta};
  font-size: 12px;
`;

export const PaginationButton = styled.button`
  display: flex;
  align-items: center;
  padding: 6px 12px;
  height: 32px;
  border: 1px solid ${({ theme }) => theme.pagination.borderColor.normal};
  box-sizing: border-box;
  border-radius: 4px;
  color: ${({ theme }) => theme.pagination.color.normal};
  background: none;
  font-family: Inter;
  margin-right: 13px;
  cursor: pointer;
  font-size: 14px;
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
