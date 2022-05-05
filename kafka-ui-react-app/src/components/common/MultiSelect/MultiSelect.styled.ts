import styled from 'styled-components';
import ReactMultiSelect from 'react-multi-select-component';

const MultiSelect = styled(ReactMultiSelect)<{ minWidth?: string }>`
  min-width: ${({ minWidth }) => minWidth || '200px;'};
  height: 32px;
  font-size: 14px;

  & > .dropdown-container {
    height: 32px;

    * {
      cursor: ${({ disabled }) => (disabled ? 'not-allowed' : 'pointer')};
    }

    & > .dropdown-heading {
      height: 32px;
      color: ${({ disabled, theme }) =>
        disabled ? theme.select.color.disabled : theme.select.color.active};
    }
  }
`;

export default MultiSelect;
