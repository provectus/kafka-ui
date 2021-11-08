import { styled } from 'lib/themedStyles';
import { Colors } from 'theme/theme';

export const MetricsContainerStyled = styled.div`
  padding: 1.5rem 1rem;
  background: ${Colors.neutral[5]};
  display: flex;
  grid-gap: 1rem;
  gap: 1rem;
  margin-bottom: 0.5rem !important;
  display: flex !important;
`;

export const MetricsLightText = styled.span`
  color: ${Colors.neutral[30]};
  font-size: 14px;
`;

export const MetricsRedText = styled.span`
  color: ${Colors.red[50]};
  font-size: 14px;
`;
