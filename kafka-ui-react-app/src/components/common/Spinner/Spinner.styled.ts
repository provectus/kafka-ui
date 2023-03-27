import styled from 'styled-components';

interface SpinnerProps {
  width: number;
  height: number;
  borderWidth: number;
  emptyBorderColor: boolean;
  borderTheme?: string;
  marginLeft?: number;
}
export const Spinner = styled.div<SpinnerProps>`
  border-width: ${(props) => props.borderWidth}px;
  border-style: solid;
  border-color: ${({ theme }) => theme.pageLoader.borderColor};
  border-bottom-color: ${(props) =>
    props.emptyBorderColor
      ? 'transparent'
      : props.theme.pageLoader.borderBottomColor};
  border-radius: 50%;
  width: ${(props) => props.width}px;
  height: ${(props) => props.height}px;
  margin-left: ${(props) => (props.marginLeft ? props.marginLeft : 0)}px;
  animation: spin 1.3s linear infinite;

  @keyframes spin {
    0% {
      transform: rotate(0deg);
    }
    100% {
      transform: rotate(360deg);
    }
  }
`;
