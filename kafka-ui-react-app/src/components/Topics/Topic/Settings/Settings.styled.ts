import styled, { css } from 'styled-components';

export const Row = styled.tr<{ $hasCustomValue?: boolean }>(
  ({ theme, $hasCustomValue }) => css`
    & > td {
      font-weight: ${$hasCustomValue ? 500 : 400};
      &:last-child {
        color: ${theme.configList.color};
        font-weight: 400;
      }
    }
  `
);
