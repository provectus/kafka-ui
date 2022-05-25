import React from 'react';
import New from 'components/Topics/New/New';
import { Route, Router } from 'react-router-dom';
import configureStore from 'redux-mock-store';
import { RootState } from 'redux/interfaces';
import * as redux from 'react-redux';
import { act, screen, waitFor } from '@testing-library/react';
import { createMemoryHistory } from 'history';
import fetchMock from 'fetch-mock-jest';
import {
  clusterTopicCopyPath,
  clusterTopicNewPath,
  clusterTopicPath,
} from 'lib/paths';
import userEvent from '@testing-library/user-event';
import { render } from 'lib/testHelpers';

const { Provider } = redux;

const mockStore = configureStore();

const clusterName = 'local';
const topicName = 'test-topic';

const initialState: Partial<RootState> = {};
const storeMock = mockStore(initialState);
const historyMock = createMemoryHistory();

const renderComponent = (history = historyMock, store = storeMock) =>
  render(
    <Router history={history}>
      <Route path={clusterTopicNewPath(':clusterName')}>
        <Provider store={store}>
          <New />
        </Provider>
      </Route>
      <Route path={clusterTopicCopyPath(':clusterName')}>
        <Provider store={store}>
          <New />
        </Provider>
      </Route>
      <Route path={clusterTopicPath(':clusterName', ':topicName')}>
        New topic path
      </Route>
    </Router>
  );

describe('New', () => {
  beforeEach(() => {
    fetchMock.reset();
  });

  it('checks header for create new', async () => {
    const mockedHistory = createMemoryHistory({
      initialEntries: [clusterTopicNewPath(clusterName)],
    });
    renderComponent(mockedHistory);
    expect(
      screen.getByRole('heading', { name: 'Create new Topic' })
    ).toHaveTextContent('Create new Topic');
  });

  it('checks header for copy', async () => {
    const mockedHistory = createMemoryHistory({
      initialEntries: [
        {
          pathname: clusterTopicCopyPath(clusterName),
          search: `?name=test`,
        },
      ],
    });

    renderComponent(mockedHistory);
    expect(
      screen.getByRole('heading', { name: 'Copy Topic' })
    ).toHaveTextContent('Copy Topic');
  });

  it('validates form', async () => {
    const mockedHistory = createMemoryHistory({
      initialEntries: [clusterTopicNewPath(clusterName)],
    });
    jest.spyOn(mockedHistory, 'push');
    renderComponent(mockedHistory);

    await waitFor(() => {
      userEvent.click(screen.getByText(/submit/i));
    });
    await waitFor(() => {
      expect(screen.getByText('name is a required field')).toBeInTheDocument();
    });
    await waitFor(() => {
      expect(mockedHistory.push).toBeCalledTimes(0);
    });
  });

  it('submits valid form', async () => {
    const useDispatchSpy = jest.spyOn(redux, 'useDispatch');
    const useDispatchMock = jest.fn(() => ({
      meta: { requestStatus: 'fulfilled' },
    })) as jest.Mock;
    useDispatchSpy.mockReturnValue(useDispatchMock);

    const mockedHistory = createMemoryHistory({
      initialEntries: [clusterTopicNewPath(clusterName)],
    });

    jest.spyOn(mockedHistory, 'push');

    await act(() => {
      renderComponent(mockedHistory);
    });

    await waitFor(() => {
      userEvent.type(screen.getByPlaceholderText('Topic Name'), topicName);
      userEvent.click(screen.getByText(/submit/i));
    });

    await waitFor(() =>
      expect(mockedHistory.location.pathname).toBe(
        clusterTopicPath(clusterName, topicName)
      )
    );

    expect(useDispatchMock).toHaveBeenCalledTimes(1);
    expect(mockedHistory.push).toBeCalledTimes(1);
  });

  it('does not redirect page when request is not fulfilled', async () => {
    const useDispatchSpy = jest.spyOn(redux, 'useDispatch');
    const useDispatchMock = jest.fn(() => ({
      meta: { requestStatus: 'pending' },
    })) as jest.Mock;
    useDispatchSpy.mockReturnValue(useDispatchMock);

    const mockedHistory = createMemoryHistory({
      initialEntries: [clusterTopicNewPath(clusterName)],
    });

    jest.spyOn(mockedHistory, 'push');

    await act(() => {
      renderComponent(mockedHistory);
    });

    await waitFor(() => {
      userEvent.type(screen.getByPlaceholderText('Topic Name'), topicName);
      userEvent.click(screen.getByText(/submit/i));
    });

    await waitFor(() =>
      expect(mockedHistory.location.pathname).toBe(
        clusterTopicNewPath(clusterName)
      )
    );
  });

  it('submits valid form that result in an error', async () => {
    const useDispatchSpy = jest.spyOn(redux, 'useDispatch');
    const useDispatchMock = jest.fn();
    useDispatchSpy.mockReturnValue(useDispatchMock);

    const mockedHistory = createMemoryHistory({
      initialEntries: [clusterTopicNewPath(clusterName)],
    });

    jest.spyOn(mockedHistory, 'push');
    renderComponent(mockedHistory);

    await act(() => {
      userEvent.type(screen.getByPlaceholderText('Topic Name'), topicName);
      userEvent.click(screen.getByText(/submit/i));
    });

    expect(useDispatchMock).toHaveBeenCalledTimes(1);
    expect(mockedHistory.push).toBeCalledTimes(0);
  });
});
