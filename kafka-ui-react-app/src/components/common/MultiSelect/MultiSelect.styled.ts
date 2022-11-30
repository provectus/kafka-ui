import styled from 'styled-components';
import { MultiSelect as ReactMultiSelect } from 'react-multi-select-component';

const MultiSelect = styled(ReactMultiSelect)<{ minWidth?: string }>`
  min-width: ${({ minWidth }) => minWidth || '200px;'};
  height: 32px;
  font-size: 14px;
  .search input {
    color: ${(props) => props.theme.input.color.normal};
    background-color: ${(props) =>
      props.theme.input.backgroundColor.normal} !important;
  }
  .select-item {
    color: ${(props) => props.theme.select.color.normal};
    background-color: ${(props) =>
      props.theme.select.backgroundColor.normal}; !important;

    &:hover {
      background-color: ${(props) =>
        props.theme.select.backgroundColor.hover}; !important;
    }
    &:active {
      background-color: ${(props) =>
        props.theme.select.backgroundColor.active}; !important;
    }
  }

  .select-item.selected{
    background-color: ${(props) =>
      props.theme.select.backgroundColor.active}; !important;
  }
  .options li{
    background-color: ${(props) => props.theme.select.backgroundColor.normal};
  }
  & > .dropdown-container {
    background-color: ${(props) => props.theme.input.backgroundColor.normal};
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
