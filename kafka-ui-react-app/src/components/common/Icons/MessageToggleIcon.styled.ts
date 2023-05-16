import styled from 'styled-components';

type Props = {
  isOpen?: boolean;
};
export const Svg = styled.svg<Props>`
  & > path {
    fill: ${({ theme, isOpen }) =>
      isOpen
        ? theme.icons.messageToggleIcon.active
        : theme.icons.messageToggleIcon.normal};
    &:hover {
      fill: ${({ theme }) => theme.icons.messageToggleIcon.hover};
    }
    &:active {
      fill: ${({ theme }) => theme.icons.messageToggleIcon.active};
    }
  }
`;
