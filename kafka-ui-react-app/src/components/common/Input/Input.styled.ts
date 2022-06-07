import styled, { css } from 'styled-components';

export interface InputProps {
  inputSize?: 'M' | 'L';
  hasLeftIcon: boolean;
}

export const Wrapper = styled.div`
  position: relative;
`;

export const Input = styled.input<InputProps>(
  ({ theme: { input }, inputSize, hasLeftIcon }) => css`
    border: 1px ${input.borderColor.normal} solid;
    border-radius: 4px;
    height: ${inputSize === 'M' ? '32px' : '40px'};
    width: 100%;
    padding-left: ${hasLeftIcon ? '36px' : '12px'};
    font-size: 14px;

    &::placeholder {
      color: ${input.color.placeholder.normal};
      font-size: 14px;
    }
    &:hover {
      border-color: ${input.borderColor.hover};
    }
    &:focus {
      outline: none;
      border-color: ${input.borderColor.focus};
      &::placeholder {
        color: transparent;
      }
    }
    &:disabled {
      color: ${input.color.disabled};
      border-color: ${input.borderColor.disabled};
      cursor: not-allowed;
    }
    &:read-only {
      color: ${input.color.readOnly};
      border: none;
      background-color: ${input.backgroundColor.readOnly};
      &:focus {
        &::placeholder {
          color: ${input.color.placeholder.readOnly};
        }
      }
      cursor: not-allowed;
    }
  `
);

export const FormError = styled.p`
  color: ${({ theme }) => theme.input.error};
  font-size: 12px;
`;

interface InputIconProps {
  className: string;
  position: 'left' | 'right';
  inputSize: 'M' | 'L';
}

export const InputIcon = styled.i<InputIconProps>`
  position: absolute;
  top: 50%;
  line-height: 0;
  z-index: 1;
  left: ${({ position }) => (position === 'left' ? '12px' : 'unset')};
  right: ${({ position }) => (position === 'right' ? '15px' : 'unset')};
  height: 11px;
  width: 11px;
  color: ${({ theme }) => theme.input.icon.color};
`;
