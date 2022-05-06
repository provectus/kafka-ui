import React from 'react';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import { connectors } from 'redux/reducers/connect/__test__/fixtures';
import { store } from 'redux/store';
import ListItem, { ListItemProps } from 'components/Connect/List/ListItem';
import ConfirmationModal from 'components/common/ConfirmationModal/ConfirmationModal';
import { ThemeProvider } from 'styled-components';
import theme from 'theme/theme';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

const mockDeleteConnector = jest.fn(() => ({ type: 'test' }));

jest.mock('redux/reducers/connect/connectSlice', () => ({
  ...jest.requireActual('redux/reducers/connect/connectSlice'),
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

  const onCancel = jest.fn();
  const onConfirm = jest.fn();
  const confirmationModal = (props: Partial<ListItemProps> = {}) => (
    <ConfirmationModal onCancel={onCancel} onConfirm={onConfirm}>
      <button type="button" id="cancel" onClick={onCancel}>
        Cancel
      </button>
      {props.clusterName ? (
        <button type="button" id="delete" onClick={onConfirm}>
          Confirm
        </button>
      ) : (
        <button type="button" id="delete">
          Confirm
        </button>
      )}
    </ConfirmationModal>
  );

  it('renders item', () => {
    render(setupWrapper());
    expect(screen.getAllByRole('cell')[6]).toHaveTextContent('2 of 2');
  });

  it('renders item with failed tasks', () => {
    render(
      setupWrapper({
        connector: {
          ...connector,
          failedTasksCount: 1,
        },
      })
    );
    expect(screen.getAllByRole('cell')[6]).toHaveTextContent('1 of 2');
  });

  it('does not render info about tasks if taksCount is undefined', () => {
    render(
      setupWrapper({
        connector: {
          ...connector,
          tasksCount: undefined,
        },
      })
    );
    expect(screen.getAllByRole('cell')[6]).toHaveTextContent('');
  });

  it('handles cancel', async () => {
    render(confirmationModal());
    userEvent.click(screen.getByText('Cancel'));
    expect(onCancel).toHaveBeenCalled();
  });

  it('handles delete', () => {
    render(confirmationModal({ clusterName: 'test' }));
    userEvent.click(screen.getByText('Confirm'));
    expect(onConfirm).toHaveBeenCalled();
  });

  it('handles delete when clusterName is not present', () => {
    render(confirmationModal({ clusterName: undefined }));
    userEvent.click(screen.getByText('Confirm'));
    expect(onConfirm).toHaveBeenCalledTimes(0);
  });
});
