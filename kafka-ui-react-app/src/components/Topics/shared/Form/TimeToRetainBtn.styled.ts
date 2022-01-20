import styled from 'styled-components';

export const TimeToRetainBtnStyled = styled.button<{ isActive: boolean }>`
  background-color: ${({ theme, ...props }) =>
    props.isActive
      ? theme.buttonStyles.primary.backgroundColor.active
      : theme.buttonStyles.primary.color};
  height: 32px;
  width: 46px;
  border: 1px solid
    ${({ theme, ...props }) =>
      props.isActive
        ? theme.buttonStyles.border.active
        : theme.buttonStyles.primary.color};
  border-radius: 6px;
  &:hover {
    cursor: pointer;
  }
`;
