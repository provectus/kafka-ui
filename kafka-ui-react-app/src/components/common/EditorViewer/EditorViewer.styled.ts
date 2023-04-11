import styled from 'styled-components';

export const Wrapper = styled.div`
  background-color: ${({ theme }) => theme.viewer.wrapper.backgroundColor};
  padding: 8px 16px;
  .ace_active-line {
    background-color: ${({ theme }) =>
      theme.default.backgroundColor} !important;
  }
  .ace_line {
    color: ${({ theme }) => theme.viewer.wrapper.color} !important;
  }
`;
