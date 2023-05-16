import Heading from 'components/common/heading/Heading.styled';
import React from 'react';
import styled from 'styled-components';

export const Wrapper = styled.div`
  width: 100%;
  background-color: ${({ theme }) => theme.layout.stuffColor};
  padding: 16px;
  display: flex;
  justify-content: center;
  align-items: stretch;
  gap: 2px;
  max-height: 700px;

  & > * {
    background-color: ${({ theme }) => theme.default.backgroundColor};
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

    p {
      color: ${({ theme }) => theme.schema.backgroundColor.p};
    }
  }
`;

export const MetaDataLabel = styled((props) => (
  <Heading level={4} {...props} />
))`
  color: ${({ theme }) => theme.lastestVersionItem.metaDataLabel.color};
  width: 110px;
`;
