import styled from 'styled-components';
import { Colors } from 'theme/theme';

type Type = 'error' | 'success' | 'warning' | 'info';

function getColor(type: Type) {
  switch (type) {
    case 'error':
      return Colors.red[10];
    case 'success':
      return Colors.green[10];
    case 'warning':
      return Colors.yellow[10];
    default:
      return Colors.neutral[10];
  }
}

export const Wrapper = styled.div<{ $type: Type }>`
  background-color: ${({ $type }) => getColor($type)};
  width: 400px;
  min-height: 64px;
  border-radius: 8px;
  padding: 12px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  filter: drop-shadow(0px 4px 16px rgba(0, 0, 0, 0.1));
  margin-top: 10px;
  line-height: 20px;
`;

export const Title = styled.div`
  font-weight: 500;
  font-size: 14px;
`;

export const Message = styled.p`
  font-weight: normal;
  font-size: 14px;
  margin: 3px 0;
`;
