import styled from 'styled-components';
import { MultiSelect as ReactMultiSelect } from 'react-multi-select-component';

const MultiSelect = styled(ReactMultiSelect)<{ minWidth?: string }>`
  min-width: ${({ minWidth }) => minWidth || '200px;'};
  height: 32px;
  font-size: 14px;
  .search input {
    color: ${({ theme }) => theme.input.color.normal};
    background-color: ${(props) =>
      props.theme.input.backgroundColor.normal} !important;
  }
  .select-item {
    color: ${({ theme }) => theme.select.color.normal};
    background-color: ${({ theme }) =>
      theme.select.backgroundColor.normal}; !important;

    &:hover {
      background-color: ${({ theme }) =>
        theme.select.backgroundColor.hover}; !important;
    }
    &:active {
      background-color: ${({ theme }) =>
        theme.select.backgroundColor.active}; !important;
    }
  }

  .select-item.selected{
    background-color: ${({ theme }) =>
      theme.select.backgroundColor.active}; !important;
  }
  .options li{
    background-color: ${({ theme }) => theme.select.backgroundColor.normal};
  }
  & > .dropdown-container {
    background-color: ${({ theme }) => theme.input.backgroundColor.normal};
    border-color: ${({ theme }) => theme.select.borderColor.normal};
    &:hover{
      border-color: ${({ theme }) => theme.select.borderColor.hover};
    }
    height: 32px;
    * {
      cursor: ${({ disabled }) => (disabled ? 'not-allowed' : 'pointer')};
    }

    & > .dropdown-heading {
      height: 32px;
      color: ${({ disabled, theme }) =>
        disabled ? theme.select.color.disabled : theme.select.color.active};
      & > .clear-selected-button {
        display: none;
      }
      &:hover {
        & > .clear-selected-button {
          display: block;
        }
      }
    }
  }
`;

export default MultiSelect;
