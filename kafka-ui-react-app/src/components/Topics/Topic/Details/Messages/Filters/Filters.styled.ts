import { styled } from 'lib/themedStyles';
import { Colors } from 'theme/theme';

export const FiltersWrapper = styled.div`
  display: flex;
  flex-direction: column;
  padding-left: 16px;
  padding-right: 16px;

  & .filters-row-1 {
    display: flex;
    justify-content: space-between;
    padding-top: 16px;

    & > div:last-child {
      width: 10%;
    }
  }

  & .filters-inputs {
    display: flex;
    gap: 8px;
    align-items: center;
    width: 90%;

    & > div:first-child {
      width: 25%;
    }

    & .seek-type-selector-wrapper {
      display: flex;

      & .select-wrapper {
        width: 40% !important;
        & > select {
          border-radius: 4px 0 0 4px !important;
        }
      }

      & .offset-selector {
        border-radius: 0 4px 4px 0 !important;
        border-left: none;
      }

      & .date-picker {
        height: 32px;
        border: 1px ${(props) => props.theme.selectStyles.borderColor.normal}
          solid;
        border-left: none;
        border-radius: 0 4px 4px 0;
        font-size: 14px;
        width: 100%;
        padding-left: 12px;
        color: ${(props) => props.theme.selectStyles.color.normal};

        background-image: url('data:image/svg+xml,%3Csvg width="10" height="6" viewBox="0 0 10 6" fill="none" xmlns="http://www.w3.org/2000/svg"%3E%3Cpath d="M1 1L5 5L9 1" stroke="%23454F54"/%3E%3C/svg%3E%0A') !important;
        background-repeat: no-repeat !important;
        background-position-x: 96% !important;
        background-position-y: 55% !important;
        appearance: none !important;

        &:hover {
          cursor: pointer;
        }
        &:focus {
          outline: none;
        }
      }
    }
  }

  & .multi-select {
    height: 32px;
    & > .dropdown-container {
      height: 32px;
      & > .dropdown-heading {
        height: 32px;
      }
    }
  }

  & .filters-metrics {
    display: flex;
    justify-content: flex-end;
    align-items: center;
    gap: 22px;
    padding-top: 16px;
    padding-bottom: 16px;

    & > .metric {
      color: ${Colors.neutral[50]};
      font-size: 12px;

      & .metric-icon {
        color: ${Colors.neutral[90]};
        padding-right: 6px;
        height: 12px;
      }
    }
  }
`;
