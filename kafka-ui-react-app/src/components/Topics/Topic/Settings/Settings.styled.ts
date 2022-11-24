import styled, { css } from 'styled-components';

export const Value = styled.span<{ $hasCustomValue?: boolean }>(
  ({ $hasCustomValue }) => css`
    font-weight: ${$hasCustomValue ? 500 : 400};
  `
);

export const DefaultValue = styled.span(
  ({ theme }) => css`
    color: ${theme.configList.color};
    font-weight: 400;
  `
);
