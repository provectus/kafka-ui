import styled, { css } from 'styled-components';

export const ConfirmationModalWrapper = styled.div.attrs({ role: 'dialog' })(
  ({ theme }) => css`
    display: flex;
    align-items: center;
    flex-direction: column;
    justify-content: center;
    overflow: hidden;
    position: fixed;
    z-index: 40;
    bottom: 0;
    left: 0;
    right: 0;
    top: 0;
    & div:first-child {
      background-color: ${theme.modal.overlay};
      bottom: 0;
      left: 0;
      position: absolute;
      right: 0;
      top: 0;
    }

    & div:last-child {
      position: absolute;
      display: flex;
      flex-direction: column;
      width: 560px;
      border-radius: 8px;

      background-color: ${theme.modal.backgroundColor};
      filter: drop-shadow(0px 4px 16px ${theme.modal.shadow});

      & > * {
        padding: 16px;
        width: 100%;
      }

      & > header {
        height: 64px;
        font-size: 20px;
        text-align: start;
      }

      & > section {
        border-top: 1px solid ${theme.modal.border.top};
        border-bottom: 1px solid ${theme.modal.border.bottom};
      }

      & > footer {
        height: 64px;
        display: flex;
        justify-content: flex-end;
        gap: 10px;
      }
    }
  `
);
