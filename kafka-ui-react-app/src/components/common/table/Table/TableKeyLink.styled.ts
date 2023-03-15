import styled, { css } from 'styled-components';

const tableLinkMixin = css(
  ({ theme }) => `
 & > a {
    color: ${theme.table.link.color.normal};
    font-weight: 500;
    text-overflow: ellipsis;

    &:hover {
      color: ${theme.table.link.color.hover};
    }

    &:active {
      color: ${theme.table.link.color.active};
    }
  }
   tr {
  background-color: red;
  }
`
);

export const TableKeyLink = styled.div`
  ${tableLinkMixin}
`;
