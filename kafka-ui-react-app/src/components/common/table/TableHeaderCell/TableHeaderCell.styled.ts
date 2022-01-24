import styled, { css } from 'styled-components';

interface TitleProps {
  isOrderable?: boolean;
  isOrdered?: boolean;
}

const isOrderableStyles = css`
  cursor: pointer;

  &:hover {
    color: ${(props) => props.theme.thStyles.color.hover};
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
  background: ${(props) => props.theme.thStyles.backgroundColor.normal};
  color: ${(props) =>
    props.isOrdered
      ? props.theme.thStyles.color.active
      : props.theme.thStyles.color.normal};
  cursor: default;

  ${(props) => props.isOrderable && isOrderableStyles}
`;

export const Preview = styled.span`
  margin-left: 8px;
  font-family: Inter, sans-serif;
  font-style: normal;
  font-weight: 400;
  line-height: 16px;
  letter-spacing: 0em;
  text-align: left;
  background: ${(props) => props.theme.thStyles.backgroundColor.normal};
  font-size: 14px;
  color: ${(props) => props.theme.thStyles.previewColor.normal};
  cursor: pointer;
`;

export const TableHeaderCell = styled.th`
  padding: 4px 0 4px 24px;
  border-bottom-width: 1px;
  vertical-align: middle;
`;
