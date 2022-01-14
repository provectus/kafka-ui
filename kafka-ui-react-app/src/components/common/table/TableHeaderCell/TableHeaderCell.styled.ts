import styled from 'styled-components';
import { Colors } from 'theme/theme';

import { TableHeaderCellProps } from './TableHeaderCell';

interface TitleProps {
  isSortable?: boolean;
  isCurrentSort?: boolean;
}
export const Title = styled.span<TitleProps>`
  font-family: Inter, sans-serif;
  font-size: 12px;
  font-style: normal;
  font-weight: 400;
  line-height: 16px;
  letter-spacing: 0em;
  text-align: left;
  background: ${(props) => props.theme.thStyles.backgroundColor.normal};
  color: ${(props) => props.theme.thStyles.color.normal};

  ${(props) =>
    props.isSortable &&
    `
    cursor: pointer;

    &:hover {
      color: ${Colors.brand[50]};
    }
  `}

  ${(props) =>
    props.isCurrentSort &&
    `
    color: ${Colors.brand[50]};
  `}
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

export const TableHeaderCell = styled.th<TableHeaderCellProps>`
  padding: 4px 0 4px 24px !important;
  border-bottom-width: 1px !important;
  vertical-align: middle !important;
`;
