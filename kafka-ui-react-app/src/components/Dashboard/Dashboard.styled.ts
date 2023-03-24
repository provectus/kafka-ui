import styled from 'styled-components';

export const Toolbar = styled.div`
  padding: 8px 16px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  color: ${({ theme }) => theme.default.color.normal};
`;
