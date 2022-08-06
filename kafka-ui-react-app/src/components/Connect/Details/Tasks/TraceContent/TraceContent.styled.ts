import styled from 'styled-components';

export const Wrapper = styled.tr`
  background-color: ${({ theme }) => theme.topicMetaData.backgroundColor};
  & > td {
    padding: 16px;
  }
`;

export const Section = styled.div`
  padding: 0 16px;
`;

export const ContentBox = styled.div`
  background-color: white;
  padding: 24px;
  border-radius: 8px 0 0 8px;
`;

export const TraceValue = styled.p`
  background-color: ${({ theme }) => theme.topicMetaData.backgroundColor};
  font-size: 14px;
`;
