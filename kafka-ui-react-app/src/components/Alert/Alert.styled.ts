import { styled } from 'lib/themedStyles';
import { Colors } from 'theme/theme';

interface Props {
  type: 'error' | 'success' | 'warning' | 'info';
}

function getColor(type: 'error' | 'success' | 'warning' | 'info') {
  switch (type) {
    case 'error':
      return Colors.red[10];
    case 'success':
      return Colors.green[10];
    case 'warning':
      return Colors.yellow[10];
    case 'info':
      return Colors.neutral[10];
    default:
      return Colors.neutral[10];
  }
}

export const AlertWrapper = styled.div<Props>`
  background-color: ${(props) => getColor(props.type)};
  width: 400px;
  height: 64px;
  border-radius: 8px;
  padding: 12px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  filter: drop-shadow(0px 4px 16px rgba(0, 0, 0, 0.1));
  & .alert-title {
    font-weight: 500;
    font-size: 14px;
  }

  & .alert-message {
    font-weight: normal;
    font-size: 14px;
  }
`;
