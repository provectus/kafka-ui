import { styled } from 'lib/themedStyles';
import { Colors } from 'theme/theme';

interface Props {
  isFullwidth?: boolean;
}

const StyledTable = styled.table<Props>`
  width: ${(props) => (props.isFullwidth ? '100%' : 'auto')};
  margin-bottom: 25px;

  & td {
    border-top: 1px #f1f2f3 solid;
    font-size: 14px;
    font-weight: 400;
    padding: 8px 8px;
    color: ${Colors.neutral[90]};
  }

  & tr {
    &:hover {
      background-color: ${Colors.neutral[5]};
    }
  }
`;

export default StyledTable;
