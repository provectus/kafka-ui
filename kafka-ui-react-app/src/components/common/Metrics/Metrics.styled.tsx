import styled, { css } from 'styled-components';

export const Wrapper = styled.div`
  padding: 1.5rem 1rem;
  background: ${({ theme }) => theme.metrics.backgroundColor};
  margin-bottom: 0.5rem !important;
  display: flex;
  gap: 16px;
  flex-wrap: wrap;
`;

export const IndicatorWrapper = styled.div`
  background-color: ${({ theme }) => theme.default.backgroundColor};
  height: 68px;
  width: fit-content;
  min-width: 150px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: flex-start;
  padding: 12px 16px;
  box-shadow: 3px 3px 3px rgba(0, 0, 0, 0.08);
  flex-grow: 1;
  color: ${({ theme }) => theme.default.color.normal};
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
  border-radius: 8px;
  overflow: auto;
  box-shadow: 3px 3px 3px rgba(0, 0, 0, 0.08);
  color: ${({ theme }) => theme.metrics.wrapper};
`;

export const SectionTitle = styled.h5`
  font-weight: 500;
  margin: 0 0 0.5rem 16px;
  font-size: 100%;
  color: ${({ theme }) => theme.metrics.sectionTitle};
`;

export const LightText = styled.span`
  color: ${({ theme }) => theme.metrics.indicator.lightTextColor};
  font-size: 14px;
`;

export const RedText = styled.span`
  color: ${({ theme }) => theme.metrics.indicator.warningTextColor};
  font-size: 14px;
`;

export const CircularAlertWrapper = styled.svg.attrs({
  role: 'svg',
  viewBox: '0 0 4 4',
  xmlns: 'http://www.w3.org/2000/svg',
})`
  grid-area: status;
  fill: none;
  width: 4px;
  height: 4px;
`;

export const CircularAlert = styled.circle.attrs({
  role: 'circle',
  cx: 2,
  cy: 2,
  r: 2,
})<{
  $type: 'error' | 'success' | 'warning' | 'info';
}>(
  ({ theme, $type }) => css`
    fill: ${theme.circularAlert.color[$type]};
  `
);
