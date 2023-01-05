import styled, { css } from 'styled-components';

export type ModalSizes = 'XS' | 'S' | 'M' | 'L';

export const Wrapper = styled.div<{ transparent: boolean }>(
  ({ theme, transparent }) => css`
    position: relative;
    display: flex;
    flex-direction: column;
    width: 90vw;
    max-width: 560px;
    max-height: 90vh;
    margin: 5vh auto;
    background-color: ${transparent
      ? 'transparent'
      : theme.modal.backgroundColor};
    padding: 20px;
    border-radius: 8px;
    overflow: hidden;
  `
);

export const CloseIconWrapper = styled.span`
  position: absolute;
  right: 16px;
  top: 16px;
  cursor: pointer;
  font-size: 24px;
`;

export const Header = styled.span`
  font-weight: 700;
  font-size: 20px;
  text-align: center;
`;
