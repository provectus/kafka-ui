import { shallow } from 'enzyme';
import React from 'react';
import ListItem from '../ListItem';

describe('ListItem', () => {
  it('triggers the deleting thunk when clicked on the delete button', () => {
    const mockDelete = jest.fn();
    const topic = { name: 'topic', id: 'id' };
    const clustterName = 'cluster';
    const component = shallow(
      <ListItem
        topic={topic}
        deleteTopic={mockDelete}
        clusterName={clustterName}
      />
    );
    component.find('DropdownItem').simulate('click');
    expect(mockDelete).toBeCalledTimes(1);
    expect(mockDelete).toBeCalledWith(clustterName, topic.name);
  });
});
