import styled from 'styled-components';

export const SchemaVersionWrapper = styled.tr`
  background-color: ${({ theme }) => theme.schema.backgroundColor.tr};
  & > td {
    padding: 16px !important;
    & > div {
      background-color: ${({ theme }) => theme.schema.backgroundColor.div};
      border-radius: 8px;
      padding: 24px;
    }
  }
`;

export const OldVersionsTitle = styled.h1`
  font-weight: 500;
  font-size: 16px;
  line-height: 24px;
  padding: 16px;
`;
