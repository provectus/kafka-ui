import styled from 'styled-components';

interface MessageLoadingProps {
  isLive: boolean;
}

interface MessageLoadingSpinnerProps {
  isFetching: boolean;
}

export const FiltersWrapper = styled.div`
  display: flex;
  flex-direction: column;
  padding-left: 16px;
  padding-right: 16px;

  & > div:first-child {
    display: flex;
    justify-content: space-between;
    padding-top: 16px;
  }
`;

export const FilterInputs = styled.div`
  display: flex;
  gap: 8px;
  align-items: center;
  width: 90%;

  & > div:first-child {
    width: 25%;
  }
`;

export const SeekTypeSelectorWrapper = styled.div`
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
    border: 1px ${(props) => props.theme.select.borderColor.normal} solid;
    border-left: none;
    border-radius: 0 4px 4px 0;
    font-size: 14px;
    width: 100%;
    padding-left: 12px;
    color: ${(props) => props.theme.select.color.normal};

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
`;

export const FiltersMetrics = styled.div`
  display: flex;
  justify-content: flex-end;
  align-items: center;
  gap: 22px;
  padding-top: 16px;
  padding-bottom: 16px;
`;

export const Metric = styled.div`
  color: ${({ theme }) => theme.metrics.filters.color.normal};
  font-size: 12px;
  display: flex;
`;

export const MetricsIcon = styled.div`
  color: ${({ theme }) => theme.metrics.filters.color.icon};
  padding-right: 6px;
  height: 12px;
`;

export const MessageLoading = styled.div<MessageLoadingProps>`
  color: ${({ theme }) => theme.heading.h3.color};
  font-size: ${({ theme }) => theme.heading.h3.fontSize};
  display: ${(props) => (props.isLive ? 'flex' : 'none')};
  justify-content: space-around;
  width: 250px;
`;

export const StopLoading = styled.div`
  color: ${({ theme }) => theme.pageLoader.borderColor};
  font-size: ${({ theme }) => theme.heading.h3.fontSize};
  cursor: pointer;
`;

export const MessageLoadingSpinner = styled.div<MessageLoadingSpinnerProps>`
  display: ${(props) => (props.isFetching ? 'block' : 'none')};
  border: 3px solid ${({ theme }) => theme.pageLoader.borderColor};
  border-bottom: 3px solid ${({ theme }) => theme.pageLoader.borderBottomColor};
  border-radius: 50%;
  width: 20px;
  height: 20px;
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
