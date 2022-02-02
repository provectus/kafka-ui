import styled, { css } from 'styled-components';

export const TopicContentWrapper = styled.tr`
  background-color: ${({ theme }) =>
    theme.consumerTopicContent.backgroundColor};
  & > td {
    padding: 16px !important;
  }
`;

export const ContentBox = styled.div(
  ({ theme }) => css`
    background-color: ${theme.menu.backgroundColor.normal};
    padding: 20px;
    border-radius: 8px;
  `
);
