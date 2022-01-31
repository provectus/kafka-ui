import styled, { css } from 'styled-components';

interface TitleProps {
  isOrderable?: boolean;
  isOrdered?: boolean;
}

const getOrderedColor = (active: string, normal: string, isOrdered?: boolean) =>
  isOrdered ? active : normal;

const isOrderableStyles = css<TitleProps>`
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
    border-bottom-color: ${({ isOrdered, theme }) =>
      getOrderedColor(
        theme.table.th.color.active,
        theme.table.th.color.normal,
        isOrdered
      )};
    margin-top: -9px;
  }

  &::after {
    border-top-color: ${({ isOrdered, theme }) =>
      getOrderedColor(
        theme.table.th.color.active,
        theme.table.th.color.normal,
        isOrdered
      )};
    margin-top: 1px;
  }

  &:hover {
    color: ${(props) => props.theme.table.th.color.hover};
    &::before {
      border-bottom-color: ${(props) => props.theme.table.th.color.hover};
    }
    &::after {
      border-top-color: ${(props) => props.theme.table.th.color.hover};
    }
  }
`;

export const Title = styled.span<TitleProps>`
  font-family: Inter, sans-serif;
  font-size: 12px;
  font-style: normal;
  font-weight: 400;
  line-height: 16px;
  letter-spacing: 0em;
  text-align: left;
  justify-content: start;
  display: flex;
  align-items: center;
  background: ${(props) => props.theme.table.th.backgroundColor.normal};
  color: ${({ isOrdered, theme }) =>
    getOrderedColor(
      theme.table.th.color.active,
      theme.table.th.color.normal,
      isOrdered
    )};
  cursor: default;

  ${(props) => props.isOrderable && isOrderableStyles};
`;

export const Preview = styled.span`
  margin-left: 8px;
  font-family: Inter, sans-serif;
  font-style: normal;
  font-weight: 400;
  line-height: 16px;
  letter-spacing: 0em;
  text-align: left;
  background: ${(props) => props.theme.table.th.backgroundColor.normal};
  font-size: 14px;
  color: ${(props) => props.theme.table.th.previewColor.normal};
  cursor: pointer;
`;

export const TableHeaderCell = styled.th`
  padding: 4px 0 4px 24px;
  border-bottom-width: 1px;
  vertical-align: middle;
`;
