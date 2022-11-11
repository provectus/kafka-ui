import React from 'react';
import { screen } from '@testing-library/dom';
import { render, WithRoute } from 'lib/testHelpers';
import { clusterBrokerConfigsPath } from 'lib/paths';
import { useBrokerConfig } from 'lib/hooks/api/brokers';
import { brokerConfigPayload } from 'lib/fixtures/brokers';
import Configs from 'components/Brokers/Broker/Configs/Configs';
import userEvent from '@testing-library/user-event';
import { usePermission } from 'lib/hooks/usePermission';

const clusterName = 'Cluster_Name';
const brokerId = 'Broker_Id';

jest.mock('lib/hooks/api/brokers', () => ({
  useBrokerConfig: jest.fn(),
  useUpdateBrokerConfigByName: jest.fn(),
}));

jest.mock('lib/hooks/usePermission', () => ({
  usePermission: jest.fn(),
}));

describe('Configs', () => {
  const renderComponent = () => {
    const path = clusterBrokerConfigsPath(clusterName, brokerId);
    return render(
      <WithRoute path={clusterBrokerConfigsPath()}>
        <Configs />
      </WithRoute>,
      { initialEntries: [path] }
    );
  };

  describe('Component Render', () => {
    beforeEach(() => {
      (useBrokerConfig as jest.Mock).mockImplementation(() => ({
        data: brokerConfigPayload,
      }));
      (usePermission as jest.Mock).mockImplementation(() => true);
      renderComponent();
    });

    it('renders configs table', async () => {
      expect(screen.getByRole('table')).toBeInTheDocument();
      expect(screen.getAllByRole('row').length).toEqual(
        brokerConfigPayload.length + 1
      );
    });

    it('updates textbox value', async () => {
      await userEvent.click(screen.getAllByLabelText('editAction')[0]);

      const textbox = screen.getByLabelText('inputValue');
      expect(textbox).toBeInTheDocument();
      expect(textbox).toHaveValue('producer');

      await userEvent.type(textbox, 'new value');

      expect(
        screen.getByRole('button', { name: 'confirmAction' })
      ).toBeInTheDocument();
      expect(
        screen.getByRole('button', { name: 'cancelAction' })
      ).toBeInTheDocument();

      await userEvent.click(
        screen.getByRole('button', { name: 'confirmAction' })
      );

      expect(
        screen.getByText('Are you sure you want to change the value?')
      ).toBeInTheDocument();
    });
  });

  describe('Permissions', () => {
    it('checks the Edit Brokers config button is disable when there is not permission', () => {
      (usePermission as jest.Mock).mockImplementation(() => false);
      (useBrokerConfig as jest.Mock).mockImplementation(() => ({
        data: brokerConfigPayload,
      }));
      renderComponent();
      const buttons = screen.getAllByRole('button', {
        name: /Edit/i,
      });
      buttons.forEach((button) => {
        expect(button).toBeDisabled();
      });
    });

    it('checks the Edit Brokers config connector button is enable when there is permission', () => {
      (usePermission as jest.Mock).mockImplementation(() => true);
      (useBrokerConfig as jest.Mock).mockImplementation(() => ({
        data: brokerConfigPayload,
      }));
      renderComponent();
      const buttons = screen.getAllByRole('button', {
        name: /Edit/i,
      });
      buttons.forEach((button) => {
        expect(button).toBeEnabled();
      });
    });
  });
});
