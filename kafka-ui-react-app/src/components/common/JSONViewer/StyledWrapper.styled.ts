import styled, { css } from 'styled-components';

export const StyledWrapper = styled.div(
  ({ theme }) => css`
    background-color: ${theme.JSONViewer.wrapper};
    padding: 8px 16px;
  `
);
