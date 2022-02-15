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
  color: ${({ theme }) => theme.version.color};
`;

export const CurrentVersion = styled.span`
  ${textStyle}
  margin-right: 0.25rem;
`;

export const OutdatedWarning = styled.span`
  ${textStyle}
`;

export const SymbolWrapper = styled.span`
  ${textStyle}
`;

export const CurrentCommitLink = styled.a`
  ${textStyle}
`;
