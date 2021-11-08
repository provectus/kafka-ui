import styled from 'styled-components';
import { Colors } from 'theme/theme';

export const LatestVersionWrapper = styled.div`
  width: 100%;
  background-color: ${Colors.neutral[5]};
  padding: 16px;
  display: flex;
  justify-content: center;
  align-items: stretch;
  gap: 2px;
  max-height: 700px;

  & > * {
    background-color: ${Colors.neutral[0]};
    padding: 24px;
    overflow-y: scroll;
  }

  & > div:first-child {
    border-radius: 8px 0px 0px 8px;
    flex-grow: 2;

    & > h1 {
      font-size: 16px;
      font-weight: 500;
    }
  }

  & > div:last-child {
    border-radius: 0px 8px 8px 0px;
    flex-grow: 1;

    & > div {
      display: flex;
      gap: 16px;
      padding-bottom: 16px;
    }
  }
`;

export const MetaDataLabel = styled.h3`
  color: ${Colors.neutral[50]};
  width: 110px;
`;
