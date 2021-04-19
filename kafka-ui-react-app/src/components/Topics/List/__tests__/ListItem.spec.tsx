import React from 'react';
import { StaticRouter } from 'react-router';
import { shallow, mount } from 'enzyme';
import {
  externalTopicPayload,
  internalTopicPayload,
} from 'redux/reducers/topics/__test__/fixtures';
import ListItem, { ListItemProps } from '../ListItem';

const mockDelete = jest.fn();
const clusterName = 'local';

describe('ListItem', () => {
  const setupComponent = (props: Partial<ListItemProps> = {}) => (
    <ListItem
      topic={internalTopicPayload}
      deleteTopic={mockDelete}
      clusterName={clusterName}
      {...props}
    />
  );

  it('triggers the deleteTopic when clicked on the delete button', () => {
    const wrapper = shallow(setupComponent());
    wrapper.find('DropdownItem').simulate('click');
    expect(mockDelete).toBeCalledTimes(1);
    expect(mockDelete).toBeCalledWith(clusterName, internalTopicPayload.name);
  });

  it('renders correct tags for internal topic', () => {
    const wrapper = mount(
      <StaticRouter>
        <table>
          <tbody>{setupComponent()}</tbody>
        </table>
      </StaticRouter>
    );

    expect(wrapper.find('.tag.is-light').text()).toEqual('Internal');
  });

  it('renders correct tags for external topic', () => {
    const wrapper = mount(
      <StaticRouter>
        <table>
          <tbody>{setupComponent({ topic: externalTopicPayload })}</tbody>
        </table>
      </StaticRouter>
    );

    expect(wrapper.find('.tag.is-primary').text()).toEqual('External');
  });
});
