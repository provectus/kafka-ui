import React from 'react';
import { mount } from 'enzyme';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import { connectorsPayload } from 'redux/reducers/connect/__test__/fixtures';
import configureStore from 'redux/store/configureStore';
import ListItem, { ListItemProps } from '../ListItem';

const store = configureStore();

jest.mock(
  'components/common/ConfirmationModal/ConfirmationModal',
  () => 'mock-ConfirmationModal'
);

describe('Connectors ListItem', () => {
  const connector = connectorsPayload[0];
  const setupWrapper = (props: Partial<ListItemProps> = {}) => (
    <Provider store={store}>
      <BrowserRouter>
        <table>
          <tbody>
            <ListItem clusterName="local" connector={connector} {...props} />
          </tbody>
        </table>
      </BrowserRouter>
    </Provider>
  );

  it('renders item', () => {
    const wrapper = mount(setupWrapper());
    expect(wrapper.find('td').at(6).find('.has-text-success').text()).toEqual(
      '2 of 2'
    );
  });

  it('renders item with failed tasks', () => {
    const wrapper = mount(
      setupWrapper({
        connector: {
          ...connector,
          failedTasksCount: 1,
        },
      })
    );
    expect(wrapper.find('td').at(6).find('.has-text-danger').text()).toEqual(
      '1 of 2'
    );
  });

  it('does not render info about tasks if taksCount is undefined', () => {
    const wrapper = mount(
      setupWrapper({
        connector: {
          ...connector,
          tasksCount: undefined,
        },
      })
    );
    expect(wrapper.find('td').at(6).text()).toEqual('');
  });

  it('handles delete', () => {
    const wrapper = mount(setupWrapper());
    expect(wrapper.find('mock-ConfirmationModal').prop('isOpen')).toBeFalsy();
    wrapper.find('DropdownItem').last().simulate('click');
    const modal = wrapper.find('mock-ConfirmationModal');
    expect(modal.prop('isOpen')).toBeTruthy();
    modal.simulate('cancel');
    expect(wrapper.find('mock-ConfirmationModal').prop('isOpen')).toBeFalsy();
  });

  it('matches snapshot', () => {
    const wrapper = mount(setupWrapper());
    expect(wrapper).toMatchSnapshot();
  });
});
