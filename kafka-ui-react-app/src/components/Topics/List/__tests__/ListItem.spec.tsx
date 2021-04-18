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
        clearTopicMessages={jest.fn()}
      />
    );
    component.find('DropdownItem').at(1).simulate('click');
    expect(mockDelete).toBeCalledTimes(1);
    expect(mockDelete).toBeCalledWith(clustterName, topic.name);
  });

  it('triggers the deleting messages when clicked on the delete messages button', () => {
    const mockDelete = jest.fn();
    const mockDeleteMessages = jest.fn();
    const topic = { name: 'topic', id: 'id' };
    const clusterName = 'cluster';
    const component = shallow(
      <ListItem
        topic={topic}
        deleteTopic={mockDelete}
        clusterName={clusterName}
        clearTopicMessages={mockDeleteMessages}
      />
    );
    component.find('DropdownItem').at(0).simulate('click');
    expect(mockDeleteMessages).toBeCalledTimes(1);
    expect(mockDeleteMessages).toBeCalledWith(clusterName, topic.name);
  });
});
