import styled from 'styled-components';

export const Wrapper = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
  gap: 20px;
`;

export const Number = styled.div`
  font-size: 100px;
  color: ${({ theme }) => theme.errorPage.text};
  line-height: initial;
`;

export const Text = styled.div`
  font-size: 20px;
`;
