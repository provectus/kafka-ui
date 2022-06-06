import React from 'react';
import { render, WithRoute } from 'lib/testHelpers';
import {
  clusterConnectConnectorPath,
  clusterConnectorNewPath,
} from 'lib/paths';
import New, { NewProps } from 'components/Connect/New/New';
import { connects, connector } from 'redux/reducers/connect/__test__/fixtures';
import { fireEvent, screen, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ControllerRenderProps } from 'react-hook-form';
import * as redux from 'react-redux';

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
  useNavigate: () => mockHistoryPush,
}));

describe('New', () => {
  const clusterName = 'my-cluster';
  const simulateFormSubmit = async () => {
    await act(() => {
      userEvent.type(
        screen.getByPlaceholderText('Connector Name'),
        'my-connector'
      );
      userEvent.type(
        screen.getByPlaceholderText('json'),
        '{"class":"MyClass"}'.replace(/[{[]/g, '$&$&')
      );
    });

    expect(screen.getByPlaceholderText('json')).toHaveValue(
      '{"class":"MyClass"}'
    );
    await act(() => {
      fireEvent.submit(screen.getByRole('form'));
    });
  };

  const renderComponent = (props: Partial<NewProps> = {}) =>
    render(
      <WithRoute path={clusterConnectorNewPath()}>
        <New
          fetchConnects={jest.fn()}
          areConnectsFetching={false}
          connects={connects}
          {...props}
        />
      </WithRoute>,
      { initialEntries: [clusterConnectorNewPath(clusterName)] }
    );

  it('fetches connects on mount', async () => {
    const fetchConnects = jest.fn();
    await act(() => {
      renderComponent({ fetchConnects });
    });
    expect(fetchConnects).toHaveBeenCalledTimes(1);
    expect(fetchConnects).toHaveBeenCalledWith(clusterName);
  });

  it('calls createConnector on form submit', async () => {
    const useDispatchSpy = jest.spyOn(redux, 'useDispatch');
    const useDispatchMock = jest.fn(() => ({
      unwrap: () => ({ connector }),
    })) as jest.Mock;
    useDispatchSpy.mockReturnValue(useDispatchMock);

    renderComponent();
    await simulateFormSubmit();

    expect(useDispatchMock).toHaveBeenCalledTimes(1);
  });

  it('redirects to connector details view on successful submit', async () => {
    const route = clusterConnectConnectorPath(
      clusterName,
      connects[0].name,
      connector.name
    );

    const useDispatchSpy = jest.spyOn(redux, 'useDispatch');
    const useDispatchMock = jest.fn(() => ({
      unwrap: () => ({ connector }),
    })) as jest.Mock;
    useDispatchSpy.mockReturnValue(useDispatchMock);

    renderComponent();

    await simulateFormSubmit();
    expect(mockHistoryPush).toHaveBeenCalledTimes(1);
    expect(mockHistoryPush).toHaveBeenCalledWith(route);
  });

  it('does not redirect to connector details view on unsuccessful submit', async () => {
    const useDispatchSpy = jest.spyOn(redux, 'useDispatch');
    const useDispatchMock = jest.fn(async () => ({
      unwrap: () => ({}),
    })) as jest.Mock;
    useDispatchSpy.mockReturnValue(useDispatchMock);

    renderComponent();
    await simulateFormSubmit();
    expect(mockHistoryPush).not.toHaveBeenCalled();
  });
});
