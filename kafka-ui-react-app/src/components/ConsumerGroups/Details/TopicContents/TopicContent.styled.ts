import { styled } from 'lib/themedStyles';
import { Colors } from 'theme/theme';

export const TopicContentWrapper = styled.tr`
  background-color: ${Colors.neutral[5]};
  & > td {
    padding: 16px !important;
  }
  & .content-box {
    background-color: white;
    padding: 20px;
    border-radius: 8px;
  }
`;
