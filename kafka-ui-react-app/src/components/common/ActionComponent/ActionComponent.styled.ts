import styled from 'styled-components';

export const Wrapper = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
`;

export const MessageTooltip = styled.div`
  background-color: ${({ theme }) => theme.tooltip.bg};
  color: ${({ theme }) => theme.tooltip.text};
  border-radius: 6px;
  padding: 5px;
  z-index: 1;
  white-space: pre-wrap;
`;

export const MessageTooltipLimited = styled(MessageTooltip)`
  max-width: 100%;
  max-height: 100%;
`;
