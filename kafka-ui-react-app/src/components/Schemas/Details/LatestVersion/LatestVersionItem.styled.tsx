import Heading from 'components/common/heading/Heading.styled';
import React from 'react';
import styled from 'styled-components';
import theme from 'theme/theme';

export const Wrapper = styled.div`
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

export const MetaDataLabel = styled((props) => (
  <Heading level={4} {...props} />
))`
  color: ${theme.lastestVersionItem.metaDataLabel.color};
  width: 110px;
`;
