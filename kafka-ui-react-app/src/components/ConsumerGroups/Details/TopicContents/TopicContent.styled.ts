import styled, { css } from 'styled-components';
import { Colors } from 'theme/theme';

export const TopicContentWrapper = styled.tr`
  background-color: ${Colors.neutral[5]};
  & > td {
    padding: 16px !important;
  }
`;

export const ContentBox = styled.div(
  ({ theme }) => css`
    background-color: ${theme.menuStyles.backgroundColor.normal};
    padding: 20px;
    border-radius: 8px;
  `
);
