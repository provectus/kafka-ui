import React from 'react';
import { useMessageFiltersStore } from 'lib/hooks/useMessageFiltersStore';
import * as StyledTable from 'components/common/NewTable/Table.styled';
import Heading from 'components/common/heading/Heading.styled';
import { Dropdown, DropdownItem } from 'components/common/Dropdown';

import Form from './Form';

export interface AdvancedFilterProps {
  onClose?: () => void;
}

const AdvancedFilter: React.FC<AdvancedFilterProps> = ({ onClose }) => {
  const { save, apply, filters, remove } = useMessageFiltersStore();

  return (
    <div>
      <Form save={save} apply={apply} onClose={onClose} />
      {filters.length > 0 && (
        <>
          <Heading level={4}>Saved Filters</Heading>
          <StyledTable.Table>
            <thead>
              <tr>
                <StyledTable.Th>Name</StyledTable.Th>
                <StyledTable.Th>Value</StyledTable.Th>
                <StyledTable.Th> </StyledTable.Th>
              </tr>
            </thead>
            <tbody>
              {filters.map((filter) => (
                <tr key={filter.name}>
                  <td>{filter.name}</td>
                  <td>
                    <pre>{filter.value}</pre>
                  </td>
                  <td>
                    <Dropdown>
                      <DropdownItem onClick={() => apply(filter)}>
                        Apply Filter
                      </DropdownItem>
                      <DropdownItem onClick={() => remove(filter.name)}>
                        Delete filter
                      </DropdownItem>
                    </Dropdown>
                  </td>
                </tr>
              ))}
            </tbody>
          </StyledTable.Table>
        </>
      )}
    </div>
  );
};

export default AdvancedFilter;
