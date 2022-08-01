import styled from 'styled-components';

export const ReplicaCell = styled.span.attrs({ 'aria-label': 'replica-info' })<{
  leader?: boolean;
}>`
  ${this} ~ ${this}::before {
    color: black;
    content: ', ';
  }
  color: ${(props) => (props.leader ? 'orange' : null)};
`;
