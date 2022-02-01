import styled from 'styled-components';

export const StyledLabel = styled.label`
  position: relative;
  display: inline-block;
  width: 34px;
  height: 20px;
  margin-right: 8px;
`;

export const StyledSlider = styled.span`
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: ${({ theme }) => theme.switch.unchecked};
  transition: 0.4s;
  border-radius: 20px;

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
  }
`;

export const StyledInput = styled.input`
  opacity: 0;
  width: 0;
  height: 0;

  &:checked + ${StyledSlider} {
    background-color: ${({ theme }) => theme.switch.checked};
  }

  &:focus + ${StyledSlider} {
    box-shadow: 0 0 1px ${({ theme }) => theme.switch.checked};
  }

  :checked + ${StyledSlider}:before {
    transform: translateX(14px);
  }
`;
