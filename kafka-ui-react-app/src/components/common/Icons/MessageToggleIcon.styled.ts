import styled from 'styled-components';

export const Svg = styled.svg`
  & > path {
    fill: ${({ theme }) => theme.icons.messageToggleIcon.normal};
    &:hover {
      fill: ${({ theme }) => theme.icons.messageToggleIcon.hover};
    }
  }
`;
