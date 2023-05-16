import styled, { css } from 'styled-components';

export const Wrapper = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 5px;
  svg {
    position: relative;
  }
`;

export const Text = styled.div(
  ({ theme }) => css`
    color: ${theme.button.primary.invertedColors.normal};
  `
);

export const LogoutLink = styled.a``;
