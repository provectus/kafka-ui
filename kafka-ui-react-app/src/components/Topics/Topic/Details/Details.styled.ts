import styled from 'styled-components';

export const DropdownExtraMessage = styled.div`
  color: ${({ theme }) => theme.topicMetaData.color.label};
  font-size: 14px;
  width: 100%;
  margin-top: 10px;
`;

export const ReplicaCell = styled.span.attrs({ 'aria-label': 'replica-info' })<{
  leader: boolean | undefined;
}>`
  ${this} ~ ${this}::before {
    color: black;
    content: ', ';
  }
  color: ${(props) => (props.leader ? 'orange' : null)};
`;
