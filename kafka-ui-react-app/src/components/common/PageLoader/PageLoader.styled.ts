import styled, { css } from 'styled-components';

export const Wrapper = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  padding-top: 15%;
  height: 100%;
  width: 100%;
`;

export const Spinner = styled.div(
  ({ theme }) => css`
    border: 10px solid ${theme.pageLoader.borderColor};
    border-bottom: 10px solid ${theme.pageLoader.borderBottomColor};
    border-radius: 50%;
    width: 80px;
    height: 80px;
    animation: spin 1.3s linear infinite;

    @keyframes spin {
      0% {
        transform: rotate(0deg);
      }
      100% {
        transform: rotate(360deg);
      }
    }
  `
);
