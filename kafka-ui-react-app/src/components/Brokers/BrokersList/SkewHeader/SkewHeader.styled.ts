import styled from 'styled-components';
import { MessageTooltip } from 'components/common/Tooltip/Tooltip.styled';

export const CellWrapper = styled.div`
  display: flex;
  gap: 10px;

  ${MessageTooltip} {
    max-height: unset;
  }
`;
