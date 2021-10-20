import { styled } from 'lib/themedStyles';
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
  & .content-box {
    background-color: white;
    padding: 24px;
    height: 412px;
  }
  & .content-wrapper {
    border-radius: 8px 0 0 8px;
    & nav {
      padding-bottom: 16px;
    }
    & .json-viewer-wrapper {
      max-height: 316px;
      width: 630px;
      overflow-y: scroll;
    }
  }
  & .metadata-wrapper {
    border-radius: 0 8px 8px 0;
    display: flex;
    flex-direction: column;
    gap: 16px;

    & .metadata {
      display: flex;
      gap: 16px;
    }
    & .metadata-label {
      color: ${Colors.neutral[50]};
      font-size: 14px;
      width: 80px;
    }
    & .metadata-value {
      color: ${Colors.neutral[80]};
      font-size: 14px;
    }
    & .metadata-meta {
      color: ${Colors.neutral[30]};
      font-size: 12px;
    }
  }
`;
