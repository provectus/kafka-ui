import React from 'react';
import { StaticRouter } from 'react-router';
import { shallow, mount } from 'enzyme';
import {
  externalTopicPayload,
  internalTopicPayload,
} from 'redux/reducers/topics/__test__/fixtures';
import ListItem, { ListItemProps } from 'components/Topics/List/ListItem';
import { ThemeProvider } from 'styled-components';
import theme from 'theme/theme';

const mockDelete = jest.fn();
const clusterName = 'local';
const mockDeleteMessages = jest.fn();
const mockToggleTopicSelected = jest.fn();

jest.mock(
  'components/common/ConfirmationModal/ConfirmationModal',
  () => 'mock-ConfirmationModal'
);

jest.mock('react-redux', () => ({
  ...jest.requireActual('react-redux'),
  useSelector: () => ['TOPIC_DELETION'],
}));

describe('ListItem', () => {
  const setupComponent = (props: Partial<ListItemProps> = {}) => (
    <StaticRouter>
      <ThemeProvider theme={theme}>
        <table>
          <tbody>
            <ListItem
              topic={internalTopicPayload}
              deleteTopic={mockDelete}
              clusterName={clusterName}
              clearTopicMessages={mockDeleteMessages}
              selected={false}
              toggleTopicSelected={mockToggleTopicSelected}
              {...props}
            />
          </tbody>
        </table>
      </ThemeProvider>
    </StaticRouter>
  );

  // it('triggers the deleting messages when clicked on the delete messages button', () => {
  //   const component = mount(setupComponent({ topic: externalTopicPayload }));
  //   expect(component.exists('.topic-action-block')).toBeTruthy();
  //   component.simulate('mouseenter');
  //   console.log(component.debug());
  //   component.find('.dropdown-item').at(0).simulate('click');
  //   expect(mockDeleteMessages).toBeCalledTimes(1);
  //   expect(mockDeleteMessages).toBeCalledWith(
  //     clusterName,
  //     externalTopicPayload.name
  //   );
  // });

  // it('triggers the deleteTopic when clicked on the delete button', () => {
  //   const wrapper = mount(setupComponent({ topic: externalTopicPayload }));
  //   expect(wrapper.exists('.topic-action-block')).toBeTruthy();
  //   wrapper.find('.dropdown-item').at(1).simulate('click');
  //   const modal = wrapper.find('mock-ConfirmationModal');
  //   expect(modal.prop('isOpen')).toBeTruthy();
  //   modal.simulate('confirm');
  //   expect(mockDelete).toBeCalledTimes(1);
  //   expect(mockDelete).toBeCalledWith(clusterName, externalTopicPayload.name);
  // });

  // it('closes ConfirmationModal when clicked on the cancel button', () => {
  //   const wrapper = mount(setupComponent({ topic: externalTopicPayload }));
  //   expect(wrapper.exists('.topic-action-block')).toBeTruthy();
  //   wrapper.find('.dropdown-item').last().simulate('click');
  //   expect(wrapper.find('mock-ConfirmationModal').prop('isOpen')).toBeTruthy();
  //   wrapper.find('mock-ConfirmationModal').simulate('cancel');
  //   expect(mockDelete).toBeCalledTimes(0);
  //   expect(wrapper.find('mock-ConfirmationModal').prop('isOpen')).toBeFalsy();
  // });

  it('renders without checkbox for internal topic', () => {
    const wrapper = mount(setupComponent());

    expect(wrapper.find('td').at(0).html()).toEqual('<td></td>');
  });

  it('renders with checkbox for external topic', () => {
    const wrapper = mount(setupComponent({ topic: externalTopicPayload }));

    expect(wrapper.find('td').at(0).html()).toEqual(
      '<td><input type="checkbox"></td>'
    );
  });

  it('triggers the toggleTopicSelected when clicked on the checkbox input', () => {
    const wrapper = mount(setupComponent({ topic: externalTopicPayload }));
    expect(wrapper.exists('input')).toBeTruthy();
    wrapper.find('input[type="checkbox"]').at(0).simulate('change');
    expect(mockToggleTopicSelected).toBeCalledTimes(1);
    expect(mockToggleTopicSelected).toBeCalledWith(externalTopicPayload.name);
  });

  it('renders correct out of sync replicas number', () => {
    const wrapper = mount(
      setupComponent({
        topic: { ...externalTopicPayload, partitions: undefined },
      })
    );

    expect(wrapper.find('td').at(3).text()).toEqual('0');
  });
});
