import styled from 'styled-components';

export const InputLabel = styled.label`
  font-weight: 500;
  font-size: 12px;
  line-height: 20px;
  color: ${({ theme }) => theme.input.label.color};
  input[type='checkbox'] {
    display: inline-block;
    margin-right: 8px;
    vertical-align: text-top;
  }
`;
