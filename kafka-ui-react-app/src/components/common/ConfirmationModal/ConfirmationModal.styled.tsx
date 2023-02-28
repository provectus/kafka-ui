import styled, { css } from 'styled-components';

export const Wrapper = styled.div.attrs({ role: 'dialog' })`
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
`;

export const Overlay = styled.div(
  ({ theme: { modal } }) => css`
    background-color: ${modal.overlay};
    bottom: 0;
    left: 0;
    position: absolute;
    right: 0;
    top: 0;
  `
);

export const Modal = styled.div(
  ({ theme: { modal, confirmModal } }) => css`
    position: absolute;
    display: flex;
    flex-direction: column;
    width: 560px;
    border-radius: 8px;

    background-color: ${confirmModal.backgroundColor};
    filter: drop-shadow(0px 4px 16px ${modal.shadow});
  `
);

export const Header = styled.div`
  font-size: 20px;
  text-align: start;
  padding: 16px;
  width: 100%;
  color: ${({ theme }) => theme.modal.color};
`;

export const Content = styled.div(
  ({ theme: { modal } }) => css`
    padding: 16px;
    width: 100%;
    border-top: 1px solid ${modal.border.top};
    border-bottom: 1px solid ${modal.border.bottom};
    color: ${modal.contentColor};
  `
);

export const Footer = styled.div`
  height: 64px;
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  padding: 16px;
  width: 100%;
`;
