import styled from 'styled-components';

export const Wrapper = styled.div`
  display: flex;
  gap: 5px;
  align-items: center;
  & > div {
    color: ${({ theme }) => theme.select.label};
  }
`;
