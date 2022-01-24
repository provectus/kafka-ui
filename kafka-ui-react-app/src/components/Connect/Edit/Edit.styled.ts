import styled from 'styled-components';
import { Colors } from 'theme/theme';

export const ConnectEditWrapperStyled = styled.div`
  margin: 16px;

  & form > *:last-child {
    margin-top: 16px;
  }
`;

export const ConnectEditWarningMessageStyled = styled.div`
  height: 48px;
  display: flex;
  align-items: center;
  background-color: ${Colors.yellow[10]};
  border-radius: 8px;
  padding: 8px;
  margin-bottom: 16px;
`;
