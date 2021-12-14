import styled from 'styled-components';

export const Wrapper = styled.div`
  padding: 1.5rem 1rem;
  background: ${({ theme }) => theme.metrics.backgroundColor};
  margin-bottom: 0.5rem !important;
  display: flex;
  gap: 16px;
  flex-wrap: wrap;
`;

export const IndicatorWrapper = styled.div`
  background-color: ${({ theme }) => theme.metrics.indicator.backgroundColor};
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

export const IndicatorTitle = styled.div`
  font-weight: 500;
  font-size: 12px;
  color: ${({ theme }) => theme.metrics.indicator.titleColor};
  display: flex;
  align-items: center;
  gap: 10px;
`;

export const IndicatorsWrapper = styled.div`
  display: flex;
  gap: 2px;
  flex-wrap: wrap;

  > ${IndicatorWrapper} {
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
    > ${IndicatorWrapper} {
      &:first-child,
      &:last-child {
        border-radius: 0;
      }
    }
  }
`;

export const SectionTitle = styled.h5`
  font-weight: 500;
  margin: 0 0 0.5rem 0;
  font-size: 100%;
`;

export const LightText = styled.span`
  color: ${({ theme }) => theme.metrics.indicator.lightTextColor};
  font-size: 14px;
`;

export const RedText = styled.span`
  color: ${({ theme }) => theme.metrics.indicator.warningTextColor};
  font-size: 14px;
`;
