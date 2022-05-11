import React from 'react';
import New from 'components/Topics/New/New';
import { Route, Router } from 'react-router';
import configureStore from 'redux-mock-store';
import { RootState } from 'redux/interfaces';
import { Provider } from 'react-redux';
import { screen, waitFor } from '@testing-library/react';
import { createMemoryHistory } from 'history';
import fetchMock from 'fetch-mock-jest';
import {
  clusterTopicCopyPath,
  clusterTopicNewPath,
  clusterTopicPath,
} from 'lib/paths';
import userEvent from '@testing-library/user-event';
import { render } from 'lib/testHelpers';

import { createTopicPayload, createTopicResponsePayload } from './fixtures';

const mockStore = configureStore();

const clusterName = 'local';
const topicName = 'test-topic';

const initialState: Partial<RootState> = {};
const storeMock = mockStore(initialState);
const historyMock = createMemoryHistory();
const createTopicAPIPath = `/api/clusters/${clusterName}/topics`;

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
    const createTopicAPIPathMock = fetchMock.postOnce(
      createTopicAPIPath,
      createTopicResponsePayload,
      {
        body: createTopicPayload,
      }
    );
    const mockedHistory = createMemoryHistory({
      initialEntries: [clusterTopicNewPath(clusterName)],
    });
    jest.spyOn(mockedHistory, 'push');
    renderComponent(mockedHistory);

    await waitFor(() => {
      userEvent.type(screen.getByPlaceholderText('Topic Name'), topicName);
      userEvent.click(screen.getByText(/submit/i));
    });

    await waitFor(() =>
      expect(mockedHistory.location.pathname).toBe(
        clusterTopicPath(clusterName, topicName)
      )
    );
    expect(mockedHistory.push).toBeCalledTimes(1);
    expect(createTopicAPIPathMock.called()).toBeTruthy();
  });

  it('submits valid form that result in an error', async () => {
    const createTopicAPIPathMock = fetchMock.postOnce(
      createTopicAPIPath,
      { throws: new Error('Something went wrong') },
      {
        body: createTopicPayload,
      }
    );

    const mocked = createMemoryHistory({
      initialEntries: [clusterTopicNewPath(clusterName)],
    });

    jest.spyOn(mocked, 'push');
    renderComponent(mocked);

    await waitFor(() => {
      userEvent.type(screen.getByPlaceholderText('Topic Name'), topicName);
      userEvent.click(screen.getByText(/submit/i));
    });

    expect(createTopicAPIPathMock.called()).toBeTruthy();
    expect(mocked.push).toBeCalledTimes(0);
  });
});
