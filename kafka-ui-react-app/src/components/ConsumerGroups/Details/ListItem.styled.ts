import styled, { css } from 'styled-components';

export const ToggleButton = styled.td`
  padding: 8px 8px 8px 16px !important;
  width: 30px;
`;

export const TableHeaderConsumerCell = styled.th(
  ({ title, theme: { table } }) => css`
    font-family: Inter, sans-serif;
    font-size: 12px;
    font-style: normal;
    font-weight: 400;
    line-height: 16px;
    letter-spacing: 0em;
    text-align: left;
    justify-content: start;
    align-items: center;
    background: ${table.th.backgroundColor.normal};
    cursor: default;
    color: ${table.th.color.normal};
    padding: 4px 0 4px
      ${(!title && 0) ||
      (title === 'Topic' && '16px') ||
      (title === 'Messages behind' && '24px')};
    border-bottom-width: 1px;
    vertical-align: middle;
    text-align: left;
  `
);
