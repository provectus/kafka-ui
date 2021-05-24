import React from 'react';
import { StaticRouter } from 'react-router';
import { shallow, mount } from 'enzyme';
import {
  externalTopicPayload,
  internalTopicPayload,
} from 'redux/reducers/topics/__test__/fixtures';
import ListItem, { ListItemProps } from 'components/Topics/List/ListItem';

const mockDelete = jest.fn();
const clusterName = 'local';
const mockDeleteMessages = jest.fn();
const mockIsReadOnly = false;

jest.mock(
  'components/common/ConfirmationModal/ConfirmationModal',
  () => 'mock-ConfirmationModal'
);

describe('ListItem', () => {
  const setupComponent = (props: Partial<ListItemProps> = {}) => (
    <ListItem
      topic={internalTopicPayload}
      deleteTopic={mockDelete}
      clusterName={clusterName}
      clearTopicMessages={mockDeleteMessages}
      isReadOnly={mockIsReadOnly}
      {...props}
    />
  );

  it('triggers the deleting messages when clicked on the delete messages button', () => {
    const component = shallow(setupComponent({ topic: externalTopicPayload }));
    expect(component.exists('.topic-action-block')).toBeTruthy();
    component.find('DropdownItem').at(0).simulate('click');
    expect(mockDeleteMessages).toBeCalledTimes(1);
    expect(mockDeleteMessages).toBeCalledWith(
      clusterName,
      externalTopicPayload.name
    );
  });

  it('triggers the deleteTopic when clicked on the delete button', () => {
    const wrapper = shallow(setupComponent({ topic: externalTopicPayload }));
    expect(wrapper.exists('.topic-action-block')).toBeTruthy();
    expect(wrapper.find('mock-ConfirmationModal').prop('isOpen')).toBeFalsy();
    wrapper.find('DropdownItem').at(1).simulate('click');
    const modal = wrapper.find('mock-ConfirmationModal');
    expect(modal.prop('isOpen')).toBeTruthy();
    modal.simulate('confirm');
    expect(mockDelete).toBeCalledTimes(1);
    expect(mockDelete).toBeCalledWith(clusterName, externalTopicPayload.name);
  });

  it('closes ConfirmationModal when clicked on the cancel button', () => {
    const wrapper = shallow(setupComponent({ topic: externalTopicPayload }));
    expect(wrapper.exists('.topic-action-block')).toBeTruthy();
    expect(wrapper.find('mock-ConfirmationModal').prop('isOpen')).toBeFalsy();
    wrapper.find('DropdownItem').last().simulate('click');
    expect(wrapper.find('mock-ConfirmationModal').prop('isOpen')).toBeTruthy();
    wrapper.find('mock-ConfirmationModal').simulate('cancel');
    expect(mockDelete).toBeCalledTimes(0);
    expect(wrapper.find('mock-ConfirmationModal').prop('isOpen')).toBeFalsy();
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

  it('renders correct out of sync replicas number', () => {
    const wrapper = mount(
      <StaticRouter>
        <table>
          <tbody>
            {setupComponent({
              topic: { ...externalTopicPayload, partitions: undefined },
            })}
          </tbody>
        </table>
      </StaticRouter>
    );

    expect(wrapper.find('td').at(2).text()).toEqual('0');
  });
});
