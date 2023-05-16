import styled from 'styled-components';

interface Props {
  isCheckedIcon?: boolean;
}

export const StyledLabel = styled.label<Props>`
  position: relative;
  display: inline-block;
  width: ${({ isCheckedIcon }) => (isCheckedIcon ? '40px' : '34px')};
  height: 20px;
  margin-right: 8px;
`;
export const CheckedIcon = styled.span`
  position: absolute;
  top: 1px;
  left: 24px;
  z-index: 10;
  cursor: pointer;
`;
export const UnCheckedIcon = styled.span`
  position: absolute;
  top: 2px;
  right: 23px;
  z-index: 10;
  cursor: pointer;
`;
export const StyledSlider = styled.span<Props>`
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: ${({ isCheckedIcon, theme }) =>
    isCheckedIcon
      ? theme.switch.checkedIcon.backgroundColor
      : theme.switch.unchecked};
  transition: 0.4s;
  border-radius: 20px;

  :hover {
    background-color: ${({ theme }) => theme.switch.hover};
  }

  &::before {
    position: absolute;
    content: '';
    height: 14px;
    width: 14px;
    left: 3px;
    bottom: 3px;
    background-color: ${({ theme }) => theme.switch.circle};
    transition: 0.4s;
    border-radius: 50%;
    z-index: 11;
  }
`;

export const StyledInput = styled.input<Props>`
  opacity: 0;
  width: 0;
  height: 0;

  &:checked + ${StyledSlider} {
    background-color: ${({ isCheckedIcon, theme }) =>
      isCheckedIcon
        ? theme.switch.checkedIcon.backgroundColor
        : theme.switch.checked};
  }

  &:focus + ${StyledSlider} {
    box-shadow: 0 0 1px ${({ theme }) => theme.switch.checked};
  }

  :checked + ${StyledSlider}:before {
    transform: translateX(
      ${({ isCheckedIcon }) => (isCheckedIcon ? '20px' : '14px')}
    );
  }
`;
