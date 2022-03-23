import styled from 'styled-components';

export const Wrapper = styled.tr`
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
