import styled from 'styled-components';

const buttonStyles = {
  primary: {
    backgroundColor: {
      normal: '#4F4FFF',
      hover: '#1717CF',
      active: '#1414B8',
    },
    color: '#FFFFFF',
    invertedColors: {
      normal: '#4F4FFF',
      hover: '#1717CF',
      active: '#1414B8',
    },
  },
  secondary: {
    backgroundColor: {
      normal: '#F1F2F3',
      hover: '#E3E6E8',
      active: '#D5DADD',
    },
    color: '#171A1C',
    invertedColors: {
      normal: '#73848C',
      hover: '#454F54',
      active: '#171A1C',
    },
  },
  height: {
    S: '24px',
    M: '32px',
    L: '40px',
  },
  fontSize: {
    S: '14px',
    M: '14px',
    L: '16px',
  },
};

interface Props {
  buttonType: 'primary' | 'secondary';
  buttonSize: 'S' | 'M' | 'L';
  isInverted?: boolean;
}

const Button = styled('button')<Props>`
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  padding: 0px 12px;
  border: none;
  border-radius: 4px;
  white-space: nowrap;
  margin-right: 0.5rem;
  margin-bottom: 0.5rem;

  background: ${(props) =>
    props.isInverted
      ? 'transparent'
      : buttonStyles[props.buttonType].backgroundColor.normal};
  color: ${(props) =>
    props.isInverted
      ? buttonStyles[props.buttonType].invertedColors.normal
      : buttonStyles[props.buttonType].color};
  font-size: ${(props) => buttonStyles.fontSize[props.buttonSize]};
  height: ${(props) => buttonStyles.height[props.buttonSize]};

  &:hover:enabled {
    background: ${(props) =>
      props.isInverted
        ? 'transparent'
        : buttonStyles[props.buttonType].backgroundColor.hover};
    color: ${(props) =>
      props.isInverted
        ? buttonStyles[props.buttonType].invertedColors.hover
        : buttonStyles[props.buttonType].color};
    cursor: pointer;
  }
  &:active:enabled {
    background: ${(props) =>
      props.isInverted
        ? 'transparent'
        : buttonStyles[props.buttonType].backgroundColor.active};
    color: ${(props) =>
      props.isInverted
        ? buttonStyles[props.buttonType].invertedColors.active
        : buttonStyles[props.buttonType].color};
  }
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

export default Button;
