import styled from 'styled-components';

export const Wrapper = styled.div`
  display: block;
  border-radius: 6px;
`;

export const Columns = styled.div`
  margin: -0.75rem;
  margin-bottom: 0.75rem;
  display: flex;
  flex-direction: column;
  padding: 0.75rem;
  gap: 8px;

  @media screen and (min-width: 769px) {
    display: flex;
  }
`;
export const Flex = styled.div`
  display: flex;
  flex-direction: row;
  gap: 8px;
  @media screen and (max-width: 1200px) {
    flex-direction: column;
  }
`;
export const FlexItem = styled.div`
  width: 18rem;
  @media screen and (max-width: 1450px) {
    width: 50%;
  }
  @media screen and (max-width: 1200px) {
    width: 100%;
  }
`;
