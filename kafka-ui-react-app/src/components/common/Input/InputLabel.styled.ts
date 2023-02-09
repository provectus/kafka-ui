import styled from 'styled-components';

interface PropsType {
  cursor?: string;
  htmlFor?: string;
}
export const InputLabel = styled.label<PropsType>`
  font-weight: 500;
  font-size: 12px;
  line-height: 20px;
  cursor: ${(props) => props?.cursor};
  color: ${({ theme }) => theme.input.label.color};

  input[type='checkbox'] {
    display: inline-block;
    margin-right: 8px;
    vertical-align: text-top;
  }
`;
