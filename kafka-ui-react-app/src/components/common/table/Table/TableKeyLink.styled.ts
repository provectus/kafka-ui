import styled, { css } from 'styled-components';

const tableLinkMixin = css(
  ({ theme }) => `
 & > a {
    color: ${theme.table.link.color};
    font-weight: 500;
    text-overflow: ellipsis;
  }
`
);

export const TableKeyLink = styled.td`
  ${tableLinkMixin}
`;

export const SmartTableKeyLink = styled.div`
  ${tableLinkMixin}
`;
