import styled from 'styled-components';

export const Textarea = styled.textarea`
  border: 1px ${({ theme }) => theme.textArea.borderColor.normal} solid;
  border-radius: 4px;
  width: 100%;
  padding: 12px;
  padding-top: 6px;
  &::placeholder {
    color: ${({ theme }) => theme.textArea.color.placeholder.normal};
    font-size: 14px;
  }
  &:hover {
    border-color: ${({ theme }) => theme.textArea.borderColor.hover};
  }
  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.textArea.borderColor.focus};
    &::placeholder {
      color: ${({ theme }) => theme.textArea.color.placeholder.normal};
    }
  }
  &:disabled {
    color: ${({ theme }) => theme.textArea.color.disabled};
    border-color: ${({ theme }) => theme.textArea.borderColor.disabled};
    cursor: not-allowed;
  }
  &:read-only {
    color: ${({ theme }) => theme.textArea.color.readOnly};
    border: none;
    background-color: ${({ theme }) => theme.textArea.backgroundColor.readOnly};
    &:focus {
      &::placeholder {
        color: ${({ theme }) =>
          theme.textArea.color.placeholder.focus.readOnly};
      }
    }
    cursor: not-allowed;
  }
`;
