import styled from 'styled-components';

interface Props {
  className: string;
  position: 'left' | 'right';
  inputSize: 'M' | 'L';
}

export const InputIcon = styled.i<Props>`
  position: absolute;
  top: 50%;
  line-height: 0;
  z-index: 1;
  left: ${(props) => (props.position === 'left' ? '12px' : 'unset')};
  right: ${(props) => (props.position === 'right' ? '15px' : 'unset')};
  height: 11px;
  width: 11px;
  color: ${({ theme }) => theme.input.icon.color};
`;
