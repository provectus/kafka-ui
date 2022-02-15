import styled, { css } from 'styled-components';

export const Wrapper = styled.div`
  display: flex;
  align-items: center;
`;

const textStyle = css`
  font-family: Inter, sans-serif;
  font-style: normal;
  font-weight: normal;
  font-size: 12px;
  line-height: 16px;
`;

export const CurrentVersion = styled.span(
  ({ theme }) => css`
    ${textStyle}
    color: ${theme.version.currentVersion.color};
    margin-right: 0.25rem;
  `
);

export const OutdatedWarning = styled.span`
  ${textStyle}
`;

export const SymbolWrapper = styled.span(
  ({ theme }) => css`
    ${textStyle}
    color: ${theme.version.symbolWrapper.color};
  `
);

export const CurrentCommitLink = styled.a`
  ${textStyle}
`;
