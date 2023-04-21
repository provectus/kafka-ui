import styled from 'styled-components';

export const ConnectorActionsWrapperStyled = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
`;
export const ButtonLabel = styled.span`
  margin-right: 11.5px;
`;
export const RestartButton = styled.div`
  padding: 0 12px;
  border: none;
  border-radius: 4px;
  display: flex;
  -webkit-align-items: center;
  background: ${({ theme }) => theme.button.primary.backgroundColor.normal};
  color: ${({ theme }) => theme.button.primary.color.normal};
  font-size: 14px;
  font-weight: 500;
  height: 32px;
`;
