import styled from 'styled-components';

export const Textarea = styled.textarea`
  border: 1px ${({ theme }) => theme.textAreaStyles.borderColor.normal} solid;
  border-radius: 4px;
  width: 100%;
  padding: 12px;
  padding-top: 6px;
  &::placeholder {
    color: ${({ theme }) => theme.textAreaStyles.color.placeholder.normal};
    font-size: 14px;
  }
  &:hover {
    border-color: ${({ theme }) => theme.textAreaStyles.borderColor.hover};
  }
  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.textAreaStyles.borderColor.focus};
    &::placeholder {
      color: ${({ theme }) => theme.textAreaStyles.color.placeholder.normal};
    }
  }
  &:disabled {
    color: ${({ theme }) => theme.textAreaStyles.color.disabled};
    border-color: ${({ theme }) => theme.textAreaStyles.borderColor.disabled};
    cursor: not-allowed;
  }
  &:read-only {
    color: ${({ theme }) => theme.textAreaStyles.color.readOnly};
    border: none;
    background-color: ${({ theme }) =>
      theme.textAreaStyles.backgroundColor.readOnly};
    &:focus {
      &::placeholder {
        color: ${({ theme }) =>
          theme.textAreaStyles.color.placeholder.focus.readOnly};
      }
    }
    cursor: not-allowed;
  }
`;
