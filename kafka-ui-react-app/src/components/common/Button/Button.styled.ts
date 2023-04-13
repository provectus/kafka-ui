import styled from 'styled-components';

export interface ButtonProps {
  buttonType: 'primary' | 'secondary' | 'danger';
  buttonSize: 'S' | 'M' | 'L';
  isInverted?: boolean;
}

const StyledButton = styled.button<ButtonProps>`
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  padding: 0 12px;
  border: none;
  border-radius: 4px;
  white-space: nowrap;

  background: ${({ isInverted, buttonType, theme }) =>
    isInverted
      ? 'transparent'
      : theme.button[buttonType].backgroundColor.normal};
  color: ${({ isInverted, buttonType, theme }) =>
    isInverted
      ? theme.button[buttonType].invertedColors.normal
      : theme.button[buttonType].color.normal};
  font-size: ${({ theme, buttonSize }) => theme.button.fontSize[buttonSize]};
  font-weight: 500;
  height: ${({ theme, buttonSize }) => theme.button.height[buttonSize]};

  &:hover:enabled {
    background: ${({ isInverted, buttonType, theme }) =>
      isInverted
        ? 'transparent'
        : theme.button[buttonType].backgroundColor.hover};
    color: ${({ isInverted, buttonType, theme }) =>
      isInverted
        ? theme.button[buttonType].invertedColors.hover
        : theme.button[buttonType].color};
    cursor: pointer;
  }
  &:active:enabled {
    background: ${({ isInverted, buttonType, theme }) =>
      isInverted
        ? 'transparent'
        : theme.button[buttonType].backgroundColor.active};
    color: ${({ isInverted, buttonType, theme }) =>
      isInverted
        ? theme.button[buttonType].invertedColors.active
        : theme.button[buttonType].color};
  }
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    background: ${({ buttonType, theme }) =>
      theme.button[buttonType].backgroundColor.disabled};
    color: ${({ buttonType, theme }) =>
      theme.button[buttonType].color.disabled};
  }

  & a {
    color: ${({ theme }) => theme.button.primary.color};
  }

  & svg {
    margin-right: 7px;
    fill: ${({ theme, disabled, buttonType }) =>
      disabled
        ? theme.button[buttonType].color.disabled
        : theme.button[buttonType].color.normal};
  }
`;

export default StyledButton;
