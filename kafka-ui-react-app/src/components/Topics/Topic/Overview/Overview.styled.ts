import styled from 'styled-components';

export const Replica = styled.span.attrs({ 'aria-label': 'replica-info' })<{
  leader?: boolean;
  outOfSync?: boolean;
}>`
  color: ${({ leader, outOfSync, theme }) => {
    if (outOfSync) return theme.topicMetaData.outOfSync.color;
    if (leader) return theme.topicMetaData.liderReplica.color;
    return null;
  }};

  font-weight: ${({ outOfSync }) => (outOfSync ? '500' : null)};

  &:after {
    content: ', ';
  }

  &:last-child::after {
    content: '';
  }
`;
