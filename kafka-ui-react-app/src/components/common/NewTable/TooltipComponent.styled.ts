import styled from 'styled-components';

export const MessageTooltip = styled.div`
  max-width: 100%;
  max-height: 100%;
  background-color: ${({ theme }) => theme.tooltip.bg};
  color: ${({ theme }) => theme.tooltip.text};
  text-align: center;
  border-radius: 6px;
  padding: 5px 0;
  z-index: 1;
`;
