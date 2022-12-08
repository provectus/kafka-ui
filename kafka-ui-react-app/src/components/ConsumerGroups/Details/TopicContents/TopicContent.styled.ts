import styled, { css } from 'styled-components';

export const TopicContentWrapper = styled.tr`
  background-color: ${({ theme }) => theme.default.backgroundColor};
  & > td {
    padding: 16px !important;
    background-color: ${({ theme }) =>
      theme.consumerTopicContent.td.backgroundColor};
  }
`;

export const ContentBox = styled.div(
  ({ theme }) => css`
    background-color: ${theme.default.backgroundColor};
    padding: 20px;
    border-radius: 8px;
  `
);
