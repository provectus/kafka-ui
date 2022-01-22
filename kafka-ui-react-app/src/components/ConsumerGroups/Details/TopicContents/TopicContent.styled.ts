import styled from 'styled-components';

export const TopicContentWrapper = styled.tr`
  background-color: ${({ theme }) =>
    theme.consumerTopicContent.backgroundColor};
  & > td {
    padding: 16px !important;
  }
`;

export const ContentBox = styled.div`
  background-color: white;
  padding: 20px;
  border-radius: 8px;
`;
