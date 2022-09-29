import styled from 'styled-components';

export const Replica = styled.span.attrs({ 'aria-label': 'replica-info' })<{
  leader?: boolean;
}>`
  color: ${({ leader, theme }) =>
    leader ? theme.topicMetaData.liderReplica.color : null};

  &:after {
    content: ', ';
  }

  &:last-child::after {
    content: '';
  }
`;
