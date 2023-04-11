import styled from 'styled-components';

interface Props {
  hasInput?: boolean;
}

export const ControlPanelWrapper = styled.div<Props>`
  display: flex;
  align-items: center;
  padding: 0 16px;
  margin: 0 0 16px;
  width: 100%;
  gap: 16px;
  color: ${({ theme }) => theme.default.color.normal};
  & > *:first-child {
    width: ${(props) => (props.hasInput ? '38%' : 'auto')};
  }
`;
