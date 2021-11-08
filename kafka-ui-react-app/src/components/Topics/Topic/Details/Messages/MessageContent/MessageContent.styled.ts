import styled from 'styled-components';
import { Colors } from 'theme/theme';

export const MessageContentWrapper = styled.tr`
  background-color: ${Colors.neutral[5]};
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

export const JSONViewerWrapper = styled.div`
  max-height: 316px;
  width: 630px;
  overflow-y: scroll;
`;

export const ContentBox = styled.div`
  background-color: white;
  padding: 24px;
  height: 412px;
  border-radius: 8px 0 0 8px;
  & nav {
    padding-bottom: 16px;
  }
`;

export const MetadataWrapper = styled.div`
  background-color: white;
  padding: 24px;
  height: 412px;
  border-radius: 0 8px 8px 0;
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

export const Metadata = styled.span`
  display: flex;
  gap: 16px;
`;

export const MetadataLabel = styled.p`
  color: ${Colors.neutral[50]};
  font-size: 14px;
  width: 80px;
`;

export const MetadataValue = styled.p`
  color: ${Colors.neutral[80]};
  font-size: 14px;
`;

export const MetadataMeta = styled.p`
  color: ${Colors.neutral[30]};
  font-size: 12px;
`;
