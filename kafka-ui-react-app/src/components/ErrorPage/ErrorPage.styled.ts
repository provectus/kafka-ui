import styled from 'styled-components';

export const Wrapper = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
  margin-top: 50px;
`;

export const Text = styled.div`
  font-size: 60px;
  color: ${({ theme }) => theme.errorPage.text};
  line-height: initial;
`;
