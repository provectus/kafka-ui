import { styled } from 'lib/themedStyles';
import { Colors } from 'theme/theme';

import { TableHeaderCellProps } from './TableHeaderCell';

const StyledTableHeaderCell = styled.th<TableHeaderCellProps>`
  padding: 4px 8px !important;
  border-bottom-width: 1px !important;
  vertical-align: middle !important;

  &.is-clickable {
    cursor: pointer !important;
    pointer-events: all !important;
  }

  &.has-text-link-dark span {
    color: ${Colors.brand[50]} !important;
  }

  span {
    font-family: Inter, sans-serif;
    font-size: 12px;
    font-style: normal;
    font-weight: 400;
    line-height: 16px;
    letter-spacing: 0em;
    text-align: left;
    background: ${(props) => props.theme.thStyles.backgroundColor.normal};
    color: ${(props) => props.theme.thStyles.color.normal};

    &.preview {
      margin-left: 8px;
      font-size: 14px;
      color: ${(props) => props.theme.thStyles.previewColor.normal};
      cursor: pointer;
    }

    &.is-clickable {
      cursor: pointer !important;
      pointer-events: all !important;
    }
  }
`;

export default StyledTableHeaderCell;
