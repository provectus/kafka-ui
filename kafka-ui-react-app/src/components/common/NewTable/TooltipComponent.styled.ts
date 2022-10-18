import styled from 'styled-components';

export const MessageTooltip = styled.div`
  max-width: 100%;
  max-height: 100%;
  background-color: ${({ theme }) => theme.configList.tooltipBackground};
  color: ${({ theme }) => theme.configList.tooltipMessage};
  text-align: center;
  border-radius: 6px;
  padding: 5px 0;
  z-index: 1;
`;
