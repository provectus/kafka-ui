import styled from 'styled-components';

export const Wrapper = styled.div`
  display: block;
  padding: 1.25rem;
  border-radius: 6px;
`;

export const Columns = styled.div`
  margin: -0.75rem;
  margin-bottom: 0.75rem;

  @media screen and (min-width: 769px) {
    display: flex;
  }
`;

export const Column = styled.div`
  flex-basis: 0;
  flex-grow: 1;
  flex-shrink: 1;
  padding: 0.75rem;
`;
