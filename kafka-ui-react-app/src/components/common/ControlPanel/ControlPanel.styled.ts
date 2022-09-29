import styled from 'styled-components';

interface Props {
  hasInput?: boolean;
}

export const ControlPanelWrapper = styled.div<Props>`
  display: flex;
  align-items: center;
  padding: 0px 16px;
  margin: 0px 0px 16px;
  width: 100%;
  gap: 16px;
  & > *:first-child {
    width: ${(props) => (props.hasInput ? '38%' : 'auto')};
  }
`;
