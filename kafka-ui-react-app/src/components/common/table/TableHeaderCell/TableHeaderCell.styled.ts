import styled, { css } from 'styled-components';
import { SortOrder } from 'generated-sources';

export interface TitleProps {
  isOrderable?: boolean;
  isOrdered?: boolean;
  sortOrder?: SortOrder;
}

const orderableMixin = css(
  ({ theme: { table } }) => `
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
      border-bottom-color: ${table.th.color.normal};
      margin-top: -9px;
    }

    &::after {
      border-top-color: ${table.th.color.normal};
      margin-top: 1px;
    }

    &:hover {
      color: ${table.th.color.hover};
      &::before {
        border-bottom-color: ${table.th.color.hover};
      }
      &::after {
        border-top-color: ${table.th.color.hover};
      }
    }
  `
);

const ASCMixin = css(
  ({ theme: { table } }) => `
    color: ${table.th.color.active};

    &:before {
        border-bottom-color: ${table.th.color.active};
    }
  `
);

const DESCMixin = css(
  ({ theme: { table } }) => `
    color: ${table.th.color.active};

    &:after {
        border-top-color: ${table.th.color.active};
    }
  `
);

export const Title = styled.span<TitleProps>(
  ({ isOrderable, isOrdered, sortOrder, theme: { table } }) => css`
    font-family: Inter, sans-serif;
    font-size: 12px;
    font-style: normal;
    font-weight: 400;
    line-height: 16px;
    letter-spacing: 0;
    text-align: left;
    display: inline-block;
    justify-content: start;
    align-items: center;
    background: ${table.th.backgroundColor.normal};
    cursor: default;
    color: ${table.th.color.normal};

    ${isOrderable && orderableMixin}

    ${isOrderable && isOrdered && sortOrder === SortOrder.ASC && ASCMixin}

    ${isOrderable && isOrdered && sortOrder === SortOrder.DESC && DESCMixin}
  `
);

export const Preview = styled.span`
  margin-left: 8px;
  font-family: Inter, sans-serif;
  font-style: normal;
  font-weight: 400;
  line-height: 16px;
  letter-spacing: 0;
  text-align: left;
  background: ${({ theme }) => theme.table.th.backgroundColor.normal};
  font-size: 14px;
  color: ${({ theme }) => theme.table.th.previewColor.normal};
  cursor: pointer;
`;

export const TableHeaderCell = styled.th`
  padding: 4px 0 4px 24px;
  border-bottom-width: 1px;
  vertical-align: middle;
  text-align: left;
`;
