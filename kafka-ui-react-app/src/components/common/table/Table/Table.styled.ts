import styled from 'styled-components';
import { Colors } from 'theme/theme';

interface Props {
  isFullwidth?: boolean;
}

export const Table = styled.table<Props>`
  width: ${(props) => (props.isFullwidth ? '100%' : 'auto')};

  & td {
    border-top: 1px #f1f2f3 solid;
    font-size: 14px;
    font-weight: 400;
    padding: 8px 8px 8px 24px;
    color: ${Colors.neutral[90]};
    vertical-align: middle;
  }

  & tbody > tr {
    &:hover {
      background-color: ${Colors.neutral[5]};
    }
  }
`;
