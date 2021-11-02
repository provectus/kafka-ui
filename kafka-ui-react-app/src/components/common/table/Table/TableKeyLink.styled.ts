import { styled } from 'lib/themedStyles';
import { Colors } from 'theme/theme';

export const TableKeyLink = styled.td`
  & > a {
    color: ${Colors.neutral[90]};
    font-weight: 500;
    text-overflow: ellipsis;
  }
`;
