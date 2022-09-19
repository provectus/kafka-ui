import styled from 'styled-components';

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
  background-color: ${({ theme }) => theme.connectEditWarning};
  border-radius: 8px;
  padding: 8px;
  margin-bottom: 16px;
`;
