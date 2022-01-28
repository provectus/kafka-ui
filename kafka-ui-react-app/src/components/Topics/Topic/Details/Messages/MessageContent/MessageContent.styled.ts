import styled from 'styled-components';

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
  & nav {
    padding-bottom: 16px;
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
  gap: 16px;
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
