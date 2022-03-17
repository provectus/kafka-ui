import React from 'react';
import { mount } from 'enzyme';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import { connectors } from 'redux/reducers/connect/__test__/fixtures';
import { store } from 'redux/store';
import ListItem, { ListItemProps } from 'components/Connect/List/ListItem';
import { ConfirmationModalProps } from 'components/common/ConfirmationModal/ConfirmationModal';
import { ThemeProvider } from 'styled-components';
import theme from 'theme/theme';

const mockDeleteConnector = jest.fn(() => ({ type: 'test' }));

jest.mock('redux/actions', () => ({
  ...jest.requireActual('redux/actions'),
  deleteConnector: () => mockDeleteConnector,
}));

jest.mock(
  'components/common/ConfirmationModal/ConfirmationModal',
  () => 'mock-ConfirmationModal'
);

describe('Connectors ListItem', () => {
  const connector = connectors[0];
  const setupWrapper = (props: Partial<ListItemProps> = {}) => (
    <ThemeProvider theme={theme}>
      <Provider store={store}>
        <BrowserRouter>
          <table>
            <tbody>
              <ListItem clusterName="local" connector={connector} {...props} />
            </tbody>
          </table>
        </BrowserRouter>
      </Provider>
    </ThemeProvider>
  );

  it('renders item', () => {
    const wrapper = mount(setupWrapper());
    expect(wrapper.find('td').at(6).text()).toEqual('2 of 2');
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
    expect(wrapper.find('td').at(6).text()).toEqual('1 of 2');
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

  it('handles cancel', () => {
    const wrapper = mount(setupWrapper());
    expect(wrapper.find('mock-ConfirmationModal').prop('isOpen')).toBeFalsy();
    wrapper.find('DropdownItem').last().simulate('click');
    const modal = wrapper.find('mock-ConfirmationModal');
    expect(modal.prop('isOpen')).toBeTruthy();
    modal.simulate('cancel');
    expect(wrapper.find('mock-ConfirmationModal').prop('isOpen')).toBeFalsy();
  });

  it('handles delete', () => {
    const wrapper = mount(setupWrapper());
    const modalProps = wrapper
      .find('mock-ConfirmationModal')
      .props() as ConfirmationModalProps;
    modalProps.onConfirm();
    expect(mockDeleteConnector).toHaveBeenCalledTimes(1);
  });

  it('handles delete when clusterName is not present', () => {
    const wrapper = mount(setupWrapper({ clusterName: undefined }));
    const modalProps = wrapper
      .find('mock-ConfirmationModal')
      .props() as ConfirmationModalProps;
    modalProps.onConfirm();
    expect(mockDeleteConnector).toHaveBeenCalledTimes(0);
  });
});
