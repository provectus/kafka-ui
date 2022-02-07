import SortableColumnHeader from 'components/common/table/SortableCulumnHeader/SortableColumnHeader';
import { mount } from 'enzyme';
import { TopicColumnsToSort } from 'generated-sources';
import React from 'react';

describe('ListHeader', () => {
  const setOrderBy = jest.fn();
  const component = mount(
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
  it('matches the snapshot', () => {
    expect(component).toMatchSnapshot();
  });

  describe('on column click', () => {
    it('calls setOrderBy', () => {
      component.find('th').simulate('click');
      expect(setOrderBy).toHaveBeenCalledTimes(1);
      expect(setOrderBy).toHaveBeenCalledWith(TopicColumnsToSort.NAME);
    });

    it('matches the snapshot', () => {
      expect(component).toMatchSnapshot();
    });
  });
});
