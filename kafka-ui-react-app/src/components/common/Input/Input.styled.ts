import styled, { css } from 'styled-components';

export interface InputProps {
  inputSize?: 'M' | 'L';
  hasLeftIcon: boolean;
}

export const Input = styled.input<InputProps>(
  ({ theme, ...props }) => css`
    border: 1px ${theme.input.borderColor.normal} solid;
    border-radius: 4px;
    height: ${props.inputSize === 'M' ? '32px' : '40px'};
    width: 100%;
    padding-left: ${props.hasLeftIcon ? '36px' : '12px'};
    font-size: 14px;

    &::placeholder {
      color: ${theme.input.color.placeholder.normal};
      font-size: 14px;
    }
    &:hover {
      border-color: ${theme.input.borderColor.hover};
    }
    &:focus {
      outline: none;
      border-color: ${theme.input.borderColor.focus};
      &::placeholder {
        color: transparent;
      }
    }
    &:disabled {
      color: ${theme.input.color.disabled};
      border-color: ${theme.input.borderColor.disabled};
      cursor: not-allowed;
    }
    &:read-only {
      color: ${theme.input.color.readOnly};
      border: none;
      background-color: ${theme.input.backgroundColor.readOnly};
      &:focus {
        &::placeholder {
          color: ${theme.input.color.placeholder.readOnly};
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
