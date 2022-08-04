import styled from 'styled-components';

export interface ButtonProps {
  buttonType: 'primary' | 'secondary';
  buttonSize: 'S' | 'M' | 'L';
  isInverted?: boolean;
}

const StyledButton = styled.button<ButtonProps>`
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  padding: 0px 12px;
  border: none;
  border-radius: 4px;
  white-space: nowrap;

  background: ${(props) =>
    props.isInverted
      ? 'transparent'
      : props.theme.button[props.buttonType].backgroundColor.normal};
  color: ${(props) =>
    props.isInverted
      ? props.theme.button[props.buttonType].invertedColors.normal
      : props.theme.button[props.buttonType].color};
  font-size: ${(props) => props.theme.button.fontSize[props.buttonSize]};
  font-weight: 500;
  height: ${(props) => props.theme.button.height[props.buttonSize]};

  &:hover:enabled {
    background: ${(props) =>
      props.isInverted
        ? 'transparent'
        : props.theme.button[props.buttonType].backgroundColor.hover};
    color: ${(props) =>
      props.isInverted
        ? props.theme.button[props.buttonType].invertedColors.hover
        : props.theme.button[props.buttonType].color};
    cursor: pointer;
  }
  &:active:enabled {
    background: ${(props) =>
      props.isInverted
        ? 'transparent'
        : props.theme.button[props.buttonType].backgroundColor.active};
    color: ${(props) =>
      props.isInverted
        ? props.theme.button[props.buttonType].invertedColors.active
        : props.theme.button[props.buttonType].color};
  }
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  & a {
    color: ${(props) => props.theme.button.primary.color};
  }

  & svg {
    margin-right: 7px;
  }
`;

export default StyledButton;
