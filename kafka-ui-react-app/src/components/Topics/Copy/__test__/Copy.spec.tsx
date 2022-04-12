import React from 'react';
import Copy from 'components/Topics/Copy/Copy';
import { Route, Router } from 'react-router';
import configureStore from 'redux-mock-store';
import { RootState } from 'redux/interfaces';
import { Provider } from 'react-redux';
import { screen, waitFor } from '@testing-library/react';
import { createMemoryHistory } from 'history';
import fetchMock from 'fetch-mock-jest';
import { clusterTopicCopyPath, clusterTopicPath } from 'lib/paths';
import userEvent from '@testing-library/user-event';
import { render } from 'lib/testHelpers';

import { createTopicPayload, createTopicResponsePayload } from './fixtures';

const mockCopyStore = configureStore();

const clusterName = 'local';
const topicName = 'test-topic';
const initialState: Partial<RootState> = {};
const storeMock = mockCopyStore(initialState);
const historyCopyMock = createMemoryHistory();
const createTopicAPIPath = `/api/clusters/${clusterName}/topics`;

const renderComponent = (history = historyCopyMock, store = storeMock) =>
  render(
    <Router history={history}>
      <Route path={clusterTopicCopyPath(clusterName)}>
        <Provider store={store}>
          <Copy />
        </Provider>
      </Route>
      <Route path={clusterTopicPath(':clusterName', ':topicName')}>
        Copy topic path
      </Route>
    </Router>
  );

describe('Copy', () => {
  beforeEach(() => {
    fetchMock.reset();
  });

  it('validates form', async () => {
    const mockedCopyHistory = createMemoryHistory({
      initialEntries: [
        `${clusterTopicCopyPath(clusterName)}/topics/test-topic`,
      ],
    });
    jest.spyOn(mockedCopyHistory, 'push');
    renderComponent(mockedCopyHistory);

    await waitFor(() => {
      userEvent.click(screen.getByText(/submit/i));
    });
    await waitFor(() => {
      expect(screen.getByText('name is a required field')).toBeInTheDocument();
    });
    await waitFor(() => {
      expect(mockedCopyHistory.push).toBeCalledTimes(0);
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
    const mockedCopyHistory = createMemoryHistory({
      initialEntries: [
        `${clusterTopicCopyPath(clusterName)}/topics/test-topic`,
      ],
    });
    jest.spyOn(mockedCopyHistory, 'push');
    renderComponent(mockedCopyHistory);

    await waitFor(() => {
      userEvent.type(screen.getByPlaceholderText('Topic Name'), topicName);
      userEvent.click(screen.getByText(/submit/i));
    });

    await waitFor(() => {
      return expect(mockedCopyHistory.location.pathname).toBe(
        `${clusterTopicPath(clusterName, topicName)}`
      );
    });
    expect(mockedCopyHistory.push).toBeCalledTimes(0);
    expect(createTopicAPIPathMock.called()).toBeFalsy();
  });
});
