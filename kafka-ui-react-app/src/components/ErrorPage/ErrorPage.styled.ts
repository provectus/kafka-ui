import styled from 'styled-components';

export const Wrapper = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
  gap: 20px;
  margin-top: 100px;
`;

export const Status = styled.div`
  font-size: 100px;
  color: ${({ theme }) => theme.default.color.normal};
  line-height: initial;
`;

export const Text = styled.div`
  font-size: 20px;
  color: ${({ theme }) => theme.default.color.normal};
`;
