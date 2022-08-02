import styled, { css } from 'styled-components';

export const NewConnectFormStyled = styled.form`
  padding: 0 16px 16px;
  display: flex;
  flex-direction: column;
  gap: 16px;

  & > button:last-child {
    align-self: flex-start;
  }
`;

export const Filed = styled.div<{ $hidden: boolean }>(
  ({ $hidden }) =>
    $hidden &&
    css`
      display: none;
    `
);
