import styled from 'styled-components';

export interface InputProps {
  inputSize?: 'M' | 'L';
  hasLeftIcon: boolean;
}

export const Input = styled.input<InputProps>`
  border: 1px ${({ theme }) => theme.inputStyles.borderColor.normal} solid;
  border-radius: 4px;
  height: ${(props) => (props.inputSize === 'M' ? '32px' : '40px')};
  width: 100%;
  padding-left: ${(props) => (props.hasLeftIcon ? '36px' : '12px')};
  font-size: 14px;

  &::placeholder {
    color: ${({ theme }) => theme.inputStyles.color.placeholder.normal};
    font-size: 14px;
  }
  &:hover {
    border-color: ${({ theme }) => theme.inputStyles.borderColor.hover};
  }
  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.inputStyles.borderColor.focus};
    &::placeholder {
      color: transparent;
    }
  }
  &:disabled {
    color: ${({ theme }) => theme.inputStyles.color.disabled};
    border-color: ${({ theme }) => theme.inputStyles.borderColor.disabled};
    cursor: not-allowed;
  }
  &:read-only {
    color: ${({ theme }) => theme.inputStyles.color.readOnly};
    border: none;
    background-color: ${({ theme }) =>
      theme.inputStyles.backgroundColor.readOnly};
    &:focus {
      &::placeholder {
        color: ${({ theme }) => theme.inputStyles.color.placeholder.readOnly};
      }
    }
    cursor: not-allowed;
  }
`;

export const FormError = styled.p`
  color: ${({ theme }) => theme.inputStyles.error};
  font-size: 12px;
`;
