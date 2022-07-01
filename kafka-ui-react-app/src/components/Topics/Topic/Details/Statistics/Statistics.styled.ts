import styled from 'styled-components';
import theme from 'theme/theme';

interface LoadingWrapperProps {
  isReady: boolean;
}

export const LoadingWrapper = styled.div<LoadingWrapperProps>`
  width: 100%;
  height: ${(props) => (props.isReady ? 40 : 308)}px;
  display: flex;
  justify-content: ${(props) => (props.isReady ? 'flex-end' : 'center')};
  align-items: center;
  flex-direction: ${(props) => (props.isReady ? 'row' : 'column')};
  padding: 0 20px;
  gap: 26px 10px;
  background-color: ${(props) =>
    props.isReady ? theme.panelColor : theme.layout.stuffColor};
  svg {
    cursor: pointer;
  }
`;
