import styled from 'styled-components';

export const ExpaderButton = styled.svg(
  ({ theme: { table } }) => `
  & > path {
    fill: ${table.expander.normal};
    &:hover {
      fill: ${table.expander.hover};
    }
  }
`
);

interface ThProps {
  sortable?: boolean;
  sortOrder?: 'desc' | 'asc' | false;
  expander?: boolean;
}

const sortableMixin = (normalColor: string, hoverColor: string) => `
  cursor: pointer;
  padding-right: 18px;
  position: relative;

  &::before,
  &::after {
    border: 4px solid transparent;
    content: '';
    display: block;
    height: 0;
    right: 5px;
    top: 50%;
    position: absolute;
  }
  &::before {
    border-bottom-color: ${normalColor};
    margin-top: -9px;
  }
  &::after {
    border-top-color: ${normalColor};
    margin-top: 1px;
  }
  &:hover {
    color: ${hoverColor};
  }
`;

const ASCMixin = (color: string) => `
  color: ${color};
  &:before {
    border-bottom-color: ${color};
  }
  &:after {
    border-top-color: rgba(0, 0, 0, 0.2);
  }
`;
const DESCMixin = (color: string) => `
  color: ${color};
  &:before {
    border-bottom-color: rgba(0, 0, 0, 0.2);
  }
  &:after {
    border-top-color: ${color};
  }
`;

export const Th = styled.th<ThProps>(
  ({ theme: { table }, sortable, sortOrder, expander }) => `
  padding: 4px 0 4px 24px;
  border-bottom-width: 1px;
  vertical-align: middle;
  text-align: left;
  font-family: Inter, sans-serif;
  font-size: 12px;
  font-style: normal;
  font-weight: 400;
  line-height: 16px;
  letter-spacing: 0em;
  text-align: left;
  background: ${table.th.backgroundColor.normal};
  width: ${expander ? '5px' : 'auto'};

  & > div {
    cursor: default;
    color: ${table.th.color.normal};
    ${
      sortable ? sortableMixin(table.th.color.normal, table.th.color.hover) : ''
    }
    ${sortable && sortOrder === 'asc' && ASCMixin(table.th.color.active)}
    ${sortable && sortOrder === 'desc' && DESCMixin(table.th.color.active)}
  }
`
);

interface RowProps {
  expandable?: boolean;
  expanded?: boolean;
}

export const Row = styled.tr<RowProps>(
  ({ theme: { table }, expanded, expandable }) => `
  cursor: ${expandable ? 'pointer' : 'default'};
  background-color: ${table.tr.backgroundColor[expanded ? 'hover' : 'normal']};
  &:hover {
    background-color: ${table.tr.backgroundColor.hover};
  }
`
);

export const ExpandedRowInfo = styled.div`
  background-color: ${({ theme }) => theme.table.tr.backgroundColor.normal};
  padding: 24px;
  border-radius: 8px;
  margin: 0 8px 8px 0;
`;

export const Nowrap = styled.div`
  white-space: nowrap;
`;

export const Table = styled.table(
  ({ theme: { table } }) => `
  width: 100%;

  td {
    border-top: 1px #f1f2f3 solid;
    font-size: 14px;
    font-weight: 400;
    padding: 8px 8px 8px 24px;
    color: ${table.td.color.normal};
    vertical-align: middle;
    max-width: 350px;
    word-wrap: break-word;

    & > a {
      color: ${table.link.color};
      font-weight: 500;
      text-overflow: ellipsis;
    }
  }
`
);

export const Pagination = styled.div`
  display: flex;
  justify-content: space-between;
  padding: 16px;
  line-height: 32px;
`;

export const Pages = styled.div`
  display: flex;
  justify-content: left;
  white-space: nowrap;
  flex-wrap: nowrap;
  gap: 8px;
`;

export const GoToPage = styled.label`
  display: flex;
  flex-wrap: nowrap;
  gap: 8px;
  margin-left: 8px;
`;

export const PageInfo = styled.div`
  display: flex;
  justify-content: right;
  gap: 8px;
  font-size: 14px;
  flex-wrap: nowrap;
  white-space: nowrap;
  margin-left: 16px;
`;
