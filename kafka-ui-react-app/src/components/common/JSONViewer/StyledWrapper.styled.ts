import styled from 'styled-components';
import { Colors } from 'theme/theme';

export const StyledWrapper = styled.div`
  background-color: ${Colors.gray[10]};
  padding: 8px 16px;
  max-height: 516px;
  overflow-y: scroll;
  overflow-wrap: anywhere;
`;
