import styled from 'styled-components';

export const TableKeyLink = styled.td`
  & > a {
    color: ${({ theme }) => theme.table.link.color};
    font-weight: 500;
    text-overflow: ellipsis;
  }
`;
