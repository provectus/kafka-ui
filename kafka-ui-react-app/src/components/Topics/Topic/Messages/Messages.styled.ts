import styled from 'styled-components';

export const Wrapper = styled.div`
  display: grid;
  grid-template-columns: 1fr 300px;
  align-items: start;

  & > div:last-child {
    border-left: 1px solid #f1f2f3;
  }
`;
