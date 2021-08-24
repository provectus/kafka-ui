import React from 'react';
import New from 'components/Topics/New/New';
import { Router } from 'react-router';
import configureStore from 'redux-mock-store';
import { RootState } from 'redux/interfaces';
import { Provider } from 'react-redux';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { createMemoryHistory } from 'history';
import fetchMock from 'fetch-mock-jest';
import { clusterTopicNewPath, clusterTopicPath } from 'lib/paths';

const mockStore = configureStore();

describe('New', () => {
  const clusterName = 'local';
  const topicName = 'test-topic';

  const initialState: Partial<RootState> = {};
  const storeMock = mockStore(initialState);
  const historyMock = createMemoryHistory();

  beforeEach(() => {
    fetchMock.restore();
  });

  const setupComponent = (history = historyMock, store = storeMock) => (
    <Router history={history}>
      <Provider store={store}>
        <New />
      </Provider>
    </Router>
  );

  it('validates form', async () => {
    const mockedHistory = createMemoryHistory();
    jest.spyOn(mockedHistory, 'push');

    render(setupComponent(mockedHistory));

    await waitFor(async () => {
      fireEvent.click(await screen.findByText('Send'));
      const errorText = await screen.findByText('Topic Name is required.');
      expect(mockedHistory.push).toBeCalledTimes(0);
      expect(errorText).toBeTruthy();
    });
  });

  it('submits valid form', async () => {
    const mockedHistory = createMemoryHistory({
      initialEntries: [clusterTopicNewPath(clusterName)],
    });
    jest.spyOn(mockedHistory, 'push');

    render(setupComponent());

    const input = await screen.findByPlaceholderText('Topic Name');
    fireEvent.change(input, { target: { value: topicName } });
    expect(input).toHaveValue(topicName);

    waitFor(async () => {
      fireEvent.click(await screen.findByText('Send'));

      expect(mockedHistory.location.pathname).toBe(
        clusterTopicPath(clusterName, topicName)
      );
      expect(mockedHistory.push).toBeCalledTimes(1);
    });
  });
});
