import SortableColumnHeader from 'components/common/table/SortableCulumnHeader/SortableColumnHeader';
import { TopicColumnsToSort } from 'generated-sources';
import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

describe('ListHeader', () => {
  const setOrderBy = jest.fn();
  const component = (
    <table>
      <thead>
        <tr>
          <SortableColumnHeader
            value={TopicColumnsToSort.NAME}
            title="Name"
            orderBy={null}
            setOrderBy={setOrderBy}
          />
        </tr>
      </thead>
    </table>
  );

  describe('on column click', () => {
    it('calls setOrderBy', () => {
      render(component);
      userEvent.click(screen.getByRole('columnheader'));
      expect(setOrderBy).toHaveBeenCalledTimes(1);
      expect(setOrderBy).toHaveBeenCalledWith(TopicColumnsToSort.NAME);
    });
  });
});
