import styled, { css } from 'styled-components';

export const Wrapper = styled.div`
  display: flex;
  align-items: baseline;
`;

const textStyle = css`
  font-family: Inter, sans-serif;
  font-style: normal;
  font-weight: normal;
  font-size: 14px;
  line-height: 20px;
`;

export const CurrentVersion = styled.span(
  ({ theme }) => css`
    ${textStyle};
    color: ${theme.version.currentVersion.color};
    margin-left: 0.25rem;
  `
);

export const OutdatedWarning = styled.span`
  ${textStyle}
`;

export const CurrentCommitLink = styled.a(
  ({ theme }) => css`
    ${textStyle};
    color: ${theme.version.commitLink.color};
    margin-left: 0.25rem;
    &:hover {
      color: ${theme.version.commitLink.color};
    }
  `
);
