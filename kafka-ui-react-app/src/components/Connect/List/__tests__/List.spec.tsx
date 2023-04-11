import React from 'react';
import { connectors } from 'lib/fixtures/kafkaConnect';
import ClusterContext, {
  ContextProps,
  initialValue,
} from 'components/contexts/ClusterContext';
import List from 'components/Connect/List/List';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { render, WithRoute } from 'lib/testHelpers';
import { clusterConnectConnectorPath, clusterConnectorsPath } from 'lib/paths';
import { useConnectors, useDeleteConnector, useUpdateConnectorState } from 'lib/hooks/api/kafkaConnect';

const mockedUsedNavigate = jest.fn();
const mockDelete = jest.fn();
const mockUpdate = jest.fn();

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockedUsedNavigate,
}));

jest.mock('lib/hooks/api/kafkaConnect', () => ({
  useConnectors: jest.fn(),
  useDeleteConnector: jest.fn(),
  useUpdateConnectorState: jest.fn(),
}));

const clusterName = 'local';

const renderComponent = (contextValue: ContextProps = initialValue) =>
  render(
    <ClusterContext.Provider value={contextValue}>
      <WithRoute path={clusterConnectorsPath()}>
        <List />
      </WithRoute>
    </ClusterContext.Provider>,
    { initialEntries: [clusterConnectorsPath(clusterName)] }
  );

describe('Connectors List', () => {
  describe('when the connectors are loaded', () => {
    beforeEach(() => {
      (useConnectors as jest.Mock).mockImplementation(() => ({
        data: connectors,
      }));
    });

    it('renders', async () => {
      renderComponent();
      expect(screen.getByRole('table')).toBeInTheDocument();
      expect(screen.getAllByRole('row').length).toEqual(3);
    });

    it('opens broker when row clicked', async () => {
      renderComponent();

      const link = await screen.findByRole('cell', {name: 'hdfs-source-connector'});

      await userEvent.click(link);
      await waitFor(() => {
        expect(mockedUsedNavigate).toBeCalledWith(
          clusterConnectConnectorPath(
            clusterName,
            'first',
            'hdfs-source-connector'
          )
        );
      });
    });

    describe('Selectable rows', () => {
      it('renders selectable rows', () => {
        renderComponent();
        expect(screen.getAllByRole('checkbox').length).toEqual(3);
      });
    });

    describe('Batch actions bar', () => {
      const getButtonByName = (name: string) => screen.getByRole('button', { name });

      beforeEach(async () => {
        (useDeleteConnector as jest.Mock).mockImplementation(() => ({
          mutateAsync: mockDelete,
        }));
        (useUpdateConnectorState as jest.Mock).mockImplementation(() => ({
          mutateAsync: mockUpdate,
        }));

        renderComponent();
        await userEvent.click(screen.getAllByRole('checkbox')[1]);
      });
      it('renders batch actions bar', () => {
        expect(getButtonByName('Pause')).toBeInTheDocument();
        expect(getButtonByName('Resume')).toBeInTheDocument();
        expect(getButtonByName('Restart Connector')).toBeInTheDocument();
        expect(getButtonByName('Restart All Tasks')).toBeInTheDocument();
        expect(getButtonByName('Restart Failed Tasks')).toBeInTheDocument();
        expect(getButtonByName('Delete')).toBeInTheDocument();
      });

      it('handles delete button click', async () => {
        const button = getButtonByName('Delete');
        await userEvent.click(button);
        expect(
          screen.getByText(
            'Are you sure you want to remove selected connectors?'
          )
        ).toBeInTheDocument();
        const confirmBtn = getButtonByName('Confirm');
        expect(mockDelete).not.toHaveBeenCalled();
        await userEvent.click(confirmBtn);
        expect(mockDelete).toHaveBeenCalledTimes(1);
        expect(screen.getAllByRole('checkbox')[1]).not.toBeChecked();
        expect(screen.getAllByRole('checkbox')[2]).not.toBeChecked();
      });

      it('handles pause button click', async () => {
        const button = getButtonByName('Pause');
        await userEvent.click(button);
        expect(
          screen.getByText(
            'Are you sure you want to pause selected connectors?'
          )
        ).toBeInTheDocument();
        const confirmBtn = getButtonByName('Confirm');
        expect(mockUpdate).not.toHaveBeenCalled();
        await userEvent.click(confirmBtn);
        expect(mockUpdate).toHaveBeenCalledTimes(1);
        expect(screen.getAllByRole('checkbox')[1]).not.toBeChecked();
        expect(screen.getAllByRole('checkbox')[2]).not.toBeChecked();
      });

      it('handles resume button click', async () => {
        const button = getButtonByName('Resume');
        await userEvent.click(button);
        expect(
          screen.getByText(
            'Are you sure you want to resume selected connectors?'
          )
        ).toBeInTheDocument();
        const confirmBtn = getButtonByName('Confirm');
        expect(mockUpdate).not.toHaveBeenCalled();
        await userEvent.click(confirmBtn);
        expect(mockUpdate).toHaveBeenCalledTimes(1);
        expect(screen.getAllByRole('checkbox')[1]).not.toBeChecked();
        expect(screen.getAllByRole('checkbox')[2]).not.toBeChecked();
      });

      it('handles restart connector button click', async () => {
        const button = getButtonByName('Restart Connector');
        await userEvent.click(button);
        expect(
          screen.getByText(
            'Are you sure you want to restart selected connectors?'
          )
        ).toBeInTheDocument();
        const confirmBtn = getButtonByName('Confirm');
        expect(mockUpdate).not.toHaveBeenCalled();
        await userEvent.click(confirmBtn);
        expect(mockUpdate).toHaveBeenCalledTimes(1);
        expect(screen.getAllByRole('checkbox')[1]).not.toBeChecked();
        expect(screen.getAllByRole('checkbox')[2]).not.toBeChecked();
      });

      it('handles restart all tasks button click', async () => {
        const button = getButtonByName('Restart All Tasks');
        await userEvent.click(button);
        expect(
          screen.getByText(
            'Are you sure you want to restart all tasks in selected connectors?'
          )
        ).toBeInTheDocument();
        const confirmBtn = getButtonByName('Confirm');
        expect(mockUpdate).not.toHaveBeenCalled();
        await userEvent.click(confirmBtn);
        expect(mockUpdate).toHaveBeenCalledTimes(1);
        expect(screen.getAllByRole('checkbox')[1]).not.toBeChecked();
        expect(screen.getAllByRole('checkbox')[2]).not.toBeChecked();
      });

      it('handles restart failed tasks button click', async () => {
        const button = getButtonByName('Restart Failed Tasks');
        await userEvent.click(button);
        expect(
          screen.getByText(
            'Are you sure you want to restart failed tasks in selected connectors?'
          )
        ).toBeInTheDocument();
        const confirmBtn = getButtonByName('Confirm');
        expect(mockUpdate).not.toHaveBeenCalled();
        await userEvent.click(confirmBtn);
        expect(mockUpdate).toHaveBeenCalledTimes(1);
        expect(screen.getAllByRole('checkbox')[1]).not.toBeChecked();
        expect(screen.getAllByRole('checkbox')[2]).not.toBeChecked();
      });
    });
  });

  describe('when table is empty', () => {
    beforeEach(() => {
      (useConnectors as jest.Mock).mockImplementation(() => ({
        data: [],
      }));
    });

    it('renders empty table', async () => {
      renderComponent();
      expect(screen.getByRole('table')).toBeInTheDocument();
      expect(
        screen.getByRole('row', { name: 'No connectors found' })
      ).toBeInTheDocument();
    });
  });

  describe('when remove connector modal is open', () => {
    beforeEach(() => {
      (useConnectors as jest.Mock).mockImplementation(() => ({
        data: connectors,
      }));
      (useDeleteConnector as jest.Mock).mockImplementation(() => ({
        mutateAsync: mockDelete,
      }));
    });

    it('calls removeConnector on confirm', async () => {
      renderComponent();
      const removeButton = screen.getAllByText('Remove Connector')[0];
      await waitFor(() => userEvent.click(removeButton));

      const submitButton = screen.getAllByRole('button', {
        name: 'Confirm',
      })[0];
      await userEvent.click(submitButton);
      expect(mockDelete).toHaveBeenCalledWith();
    });

    it('closes the modal when cancel button is clicked', async () => {
      renderComponent();
      const removeButton = screen.getAllByText('Remove Connector')[0];
      await waitFor(() => userEvent.click(removeButton));

      const cancelButton = screen.getAllByRole('button', {
        name: 'Cancel',
      })[0];
      await waitFor(() => userEvent.click(cancelButton));
      expect(cancelButton).not.toBeInTheDocument();
    });
  });
});
