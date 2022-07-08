import ReactDatePicker from 'react-datepicker';
import styled from 'styled-components';

export const Wrapper = styled.div`
  padding: 16px;
  padding-top: 0;

  & > form {
    display: flex;
    flex-direction: column;
    gap: 16px;

    & > button:last-child {
      align-self: flex-start;
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
`;

export const DatePickerInput = styled(ReactDatePicker)`
  height: 32px;
  border: 1px ${(props) => props.theme.select.borderColor.normal} solid;
  border-radius: 4px;
  font-size: 14px;
  width: 50%;
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
`;

export const MainSelectors = styled.div`
  display: flex;
  gap: 16px;
  & > * {
    flex-grow: 1;
  }
`;

export const OffsetsWrapper = styled.div`
  display: flex;
  width: 100%;
  flex-wrap: wrap;
  gap: 16px;
`;

export const OffsetsTitle = styled.h1`
  font-size: 18px;
  font-weight: 500;
`;
