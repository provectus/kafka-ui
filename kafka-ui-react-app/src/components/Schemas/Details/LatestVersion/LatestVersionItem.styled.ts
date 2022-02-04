import styled from 'styled-components';
import theme from 'theme/theme';

export const LatestVersionWrapper = styled.div`
  width: 100%;
  background-color: ${theme.layout.stuffColor};
  padding: 16px;
  display: flex;
  justify-content: center;
  align-items: stretch;
  gap: 2px;
  max-height: 700px;

  & > * {
    background-color: ${theme.panelColor};
    padding: 24px;
    overflow-y: scroll;
  }

  & > div:first-child {
    border-radius: 8px 0 0 8px;
    flex-grow: 2;

    & > h1 {
      font-size: 16px;
      font-weight: 500;
    }
  }

  & > div:last-child {
    border-radius: 0 8px 8px 0;
    flex-grow: 1;

    & > div {
      display: flex;
      gap: 16px;
      padding-bottom: 16px;
    }
  }
`;

export const MetaDataLabel = styled.h3`
  color: ${theme.heading.h3.color};
  width: 110px;
  font-size: ${theme.heading.h3.fontSize};
`;
