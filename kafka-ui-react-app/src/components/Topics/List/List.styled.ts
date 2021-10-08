import { styled } from 'lib/themedStyles';

export const ListWrapper = styled.div`
  & .control-panel {
    display: flex;
    align-items: center;
    padding: 0 16px;
    margin: 8px 0px;
    width: 100%;
    gap: 16px;
    & .topics-search {
      width: 38%;
    }
  }
`;
