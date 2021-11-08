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
      : props.theme.buttonStyles[props.buttonType].backgroundColor.normal};
  color: ${(props) =>
    props.isInverted
      ? props.theme.buttonStyles[props.buttonType].invertedColors.normal
      : props.theme.buttonStyles[props.buttonType].color};
  font-size: ${(props) => props.theme.buttonStyles.fontSize[props.buttonSize]};
  height: ${(props) => props.theme.buttonStyles.height[props.buttonSize]};

  &:hover:enabled {
    background: ${(props) =>
      props.isInverted
        ? 'transparent'
        : props.theme.buttonStyles[props.buttonType].backgroundColor.hover};
    color: ${(props) =>
      props.isInverted
        ? props.theme.buttonStyles[props.buttonType].invertedColors.hover
        : props.theme.buttonStyles[props.buttonType].color};
    cursor: pointer;
  }
  &:active:enabled {
    background: ${(props) =>
      props.isInverted
        ? 'transparent'
        : props.theme.buttonStyles[props.buttonType].backgroundColor.active};
    color: ${(props) =>
      props.isInverted
        ? props.theme.buttonStyles[props.buttonType].invertedColors.active
        : props.theme.buttonStyles[props.buttonType].color};
  }
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  & a {
    color: white;
  }

  & i {
    margin-right: 7px;
  }
`;

export default StyledButton;
