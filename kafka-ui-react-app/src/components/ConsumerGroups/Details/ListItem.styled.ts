import { styled } from 'lib/themedStyles';
import { Colors } from 'theme/theme';

export const ListItemWrapper = styled.tr`
  & .toggle-button {
    padding: 8px 8px 8px 16px !important;
    width: 30px;
  }

  & .topic-link {
    color: ${Colors.neutral[90]};
    font-weight: 500;
  }
`;
