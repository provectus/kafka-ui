import styled from 'styled-components';
import ReactMultiSelect from 'react-multi-select-component';

const MultiSelect = styled(ReactMultiSelect)<{ minWidth?: string }>`
  min-width: ${({ minWidth }) => minWidth || '200px;'};
  height: 32px;
  font-size: 14px;

  & > .dropdown-container {
    height: 32px;

    & > .dropdown-heading {
      height: 32px;
    }
  }
`;

export default MultiSelect;
