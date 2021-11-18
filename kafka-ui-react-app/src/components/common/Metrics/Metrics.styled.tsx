import styled from 'styled-components';
import { Colors } from 'theme/theme';

export const StyledMetricsWrapper = styled.div`
  padding: 1.5rem 1rem;
  background: ${Colors.neutral[5]};
  margin-bottom: 0.5rem !important;
  display: flex;
  gap: 16px;
  flex-wrap: wrap;
`;

export const StyledIndicator = styled.div`
  background-color: white;
  height: 68px;
  width: fit-content;
  min-width: 150px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: flex-start;
  padding: 12px 16px;
  box-shadow: 3px 3px 3px rgba(0, 0, 0, 0.08);
  margin: 0 0 3px 0;
  flex-grow: 1;
`;

export const StyledIndicatorTitle = styled.div`
  font-weight: 500;
  font-size: 12px;
  color: ${Colors.neutral[50]};
  display: flex;
  align-items: center;
  gap: 10px;
`;

export const StyledIndicatorsWrapper = styled.div`
  display: flex;
  gap: 2px;
  flex-wrap: wrap;

  > ${StyledIndicator} {
    &:first-child {
      border-top-left-radius: 8px;
      border-bottom-left-radius: 8px;
    }
    &:last-child {
      border-top-right-radius: 8px;
      border-bottom-right-radius: 8px;
    }
  }

  @media screen and (max-width: 1023px) {
    > ${StyledIndicator} {
      &:first-child,
      &:last-child {
        border-radius: 0;
      }
    }
  }
`;

export const MetricsLightText = styled.span`
  color: ${Colors.neutral[30]};
  font-size: 14px;
`;

export const MetricsRedText = styled.span`
  color: ${Colors.red[50]};
  font-size: 14px;
`;
