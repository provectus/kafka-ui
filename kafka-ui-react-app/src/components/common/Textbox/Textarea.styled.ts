import styled from 'styled-components';
import { Colors } from 'theme/theme';

export const Textarea = styled.textarea`
  border: 1px ${Colors.neutral[30]} solid;
  border-radius: 4px;
  width: 100%;
  padding: 12px;
  padding-top: 6px;

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
