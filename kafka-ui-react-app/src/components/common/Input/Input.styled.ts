import styled from 'styled-components';
import { Colors } from 'theme/theme';

export interface InputProps {
  inputSize?: 'M' | 'L';
  hasLeftIcon: boolean;
}

export const Input = styled.input<InputProps>`
  border: 1px ${Colors.neutral[30]} solid;
  border-radius: 4px;
  height: ${(props) => (props.inputSize === 'M' ? '32px' : '40px')};
  width: 100%;
  padding-left: ${(props) => (props.hasLeftIcon ? '36px' : '12px')};
  font-size: 14px;

  &::placeholder {
    color: ${Colors.neutral[30]};
    font-size: 14px;
  }
  &:hover {
    border-color: ${Colors.neutral[50]};
  }
  &:focus {
    outline: none;
    border-color: ${Colors.neutral[70]};
    &::placeholder {
      color: transparent;
    }
  }
  &:disabled {
    color: ${Colors.neutral[30]};
    border-color: ${Colors.neutral[10]};
    cursor: not-allowed;
  }
  &:read-only {
    color: ${Colors.neutral[90]};
    border: none;
    background-color: ${Colors.neutral[5]};
    &:focus {
      &::placeholder {
        color: ${Colors.neutral[30]};
      }
    }
    cursor: not-allowed;
  }
`;

export const FormError = styled.p`
  color: ${Colors.red[50]};
  font-size: 12px;
`;
