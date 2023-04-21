import styled, { css } from 'styled-components';

export const Wrapper = styled.div`
  height: 10px;
  width: 100%;
  min-width: 200px;
  background-color: ${({ theme }) => theme.progressBar.backgroundColor};
  border-radius: 5px;
  margin: 16px;
  border: 1px solid ${({ theme }) => theme.progressBar.borderColor};
`;

export const Filler = styled.div<{ completed: number }>(
  ({ theme: { progressBar }, completed }) => css`
    height: 100%;
    width: ${completed}%;
    background-color: ${progressBar.compleatedColor};
    border-radius: 5px;
    text-align: right;
    transition: width 1.2s linear;
  `
);
