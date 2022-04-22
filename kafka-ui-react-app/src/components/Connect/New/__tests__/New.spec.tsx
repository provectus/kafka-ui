import React from 'react';
import { containerRendersView, render } from 'lib/testHelpers';
import {
  clusterConnectConnectorPath,
  clusterConnectorNewPath,
} from 'lib/paths';
import NewContainer from 'components/Connect/New/NewContainer';
import New, { NewProps } from 'components/Connect/New/New';
import { connects, connector } from 'redux/reducers/connect/__test__/fixtures';
import { Route } from 'react-router';
import { act, fireEvent, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { waitFor } from '@testing-library/dom';
import { ControllerRenderProps } from 'react-hook-form';

jest.mock('components/common/PageLoader/PageLoader', () => 'mock-PageLoader');
jest.mock(
  'components/common/Editor/Editor',
  () => (props: ControllerRenderProps) => {
    return <textarea {...props} placeholder="json" />;
  }
);

const mockHistoryPush = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useHistory: () => ({
    push: mockHistoryPush,
  }),
}));

describe('New', () => {
  containerRendersView(<NewContainer />, New);

  describe('view', () => {
    const clusterName = 'my-cluster';
    const simulateFormSubmit = async () => {
      userEvent.type(
        screen.getByPlaceholderText('Connector Name'),
        'my-connector'
      );
      userEvent.type(
        screen.getByPlaceholderText('json'),
        '{"class":"MyClass"}'.replace(/[{[]/g, '$&$&')
      );
      expect(screen.getByPlaceholderText('json')).toHaveValue(
        '{"class":"MyClass"}'
      );
      await waitFor(() => {
        fireEvent.submit(screen.getByRole('form'));
      });
    };

    const renderComponent = (props: Partial<NewProps> = {}) =>
      render(
        <Route path={clusterConnectorNewPath(':clusterName')}>
          <New
            fetchConnects={jest.fn()}
            areConnectsFetching={false}
            connects={connects}
            createConnector={jest.fn()}
            {...props}
          />
        </Route>,
        { pathname: clusterConnectorNewPath(clusterName) }
      );

    it('fetches connects on mount', async () => {
      const fetchConnects = jest.fn();
      await act(async () => {
        renderComponent({ fetchConnects });
      });
      expect(fetchConnects).toHaveBeenCalledTimes(1);
      expect(fetchConnects).toHaveBeenCalledWith(clusterName);
    });

    it('calls createConnector on form submit', async () => {
      const createConnector = jest.fn();
      renderComponent({ createConnector });
      await simulateFormSubmit();
      expect(createConnector).toHaveBeenCalledTimes(1);
      expect(createConnector).toHaveBeenCalledWith({
        clusterName,
        connectName: connects[0].name,
        newConnector: {
          name: 'my-connector',
          config: { class: 'MyClass' },
        },
      });
    });

    it('redirects to connector details view on successful submit', async () => {
      const createConnector = jest.fn().mockResolvedValue({ connector });
      renderComponent({ createConnector });
      await simulateFormSubmit();
      expect(mockHistoryPush).toHaveBeenCalledTimes(1);
      expect(mockHistoryPush).toHaveBeenCalledWith(
        clusterConnectConnectorPath(
          clusterName,
          connects[0].name,
          connector.name
        )
      );
    });

    it('does not redirect to connector details view on unsuccessful submit', async () => {
      const createConnector = jest.fn().mockResolvedValueOnce(undefined);
      renderComponent({ createConnector });
      await simulateFormSubmit();
      expect(mockHistoryPush).not.toHaveBeenCalled();
    });
  });
});
