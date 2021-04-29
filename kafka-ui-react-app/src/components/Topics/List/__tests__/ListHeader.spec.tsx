import ListHeader from 'components/Topics/List/ListHeader';
import { mount } from 'enzyme';
import { TopicColumnsToSort } from 'generated-sources';
import React from 'react';

describe('ListHeader', () => {
  const setOrderBy = jest.fn();
  const component = mount(
    <table>
      <ListHeader orderBy={undefined} setOrderBy={setOrderBy} />
    </table>
  );
  it('matches the snapshot', () => {
    expect(component).toMatchSnapshot();
  });

  describe('on column click', () => {
    it('calls setOrderBy', () => {
      component.find('th').at(0).simulate('click');
      expect(setOrderBy).toHaveBeenCalledTimes(1);
      expect(setOrderBy).toHaveBeenCalledWith(TopicColumnsToSort.NAME);
      component.find('th').at(1).simulate('click');
      expect(setOrderBy).toHaveBeenCalledTimes(2);
      expect(setOrderBy).toHaveBeenCalledWith(
        TopicColumnsToSort.TOTAL_PARTITIONS
      );
      component.find('th').at(2).simulate('click');
      expect(setOrderBy).toHaveBeenCalledTimes(3);
      expect(setOrderBy).toHaveBeenCalledWith(
        TopicColumnsToSort.OUT_OF_SYNC_REPLICAS
      );
    });
    it('matches the snapshot', () => {
      expect(component.find('th').at(2)).toMatchSnapshot();
    });
  });
});
