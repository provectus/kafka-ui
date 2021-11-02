import { styled } from 'lib/themedStyles';

export const QueryWrapper = styled.div`
  padding: 16px;

  & .ksql-inputs-wrapper {
    width: 100%;
    display: flex;
    gap: 24px;

    padding-bottom: 16px;
    & > div {
      flex-grow: 1;
    }
  }

  & .ksql-input-header {
    display: flex;
    justify-content: space-between;
  }

  & .ksql-buttons {
    display: flex;
    gap: 16px;
  }
`;
