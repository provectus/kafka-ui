import { styled } from 'lib/themedStyles';

export const ControlPanelWrapper = styled.div`
  display: flex;
  align-items: center;
  padding: 0px 16px;
  margin: 16px 0px;
  width: 100%;
  gap: 16px;
  & > *:first-child {
    width: 38%;
  }
`;
