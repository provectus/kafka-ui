import React from 'react';
import New from 'components/Topics/New/New';
import { Router } from 'react-router';
import configureStore from 'redux-mock-store';
import { RootState } from 'redux/interfaces';
import { Provider } from 'react-redux';
import { render, screen, waitFor } from '@testing-library/react';
import { createMemoryHistory } from 'history';
import fetchMock from 'fetch-mock-jest';
import { clusterTopicNewPath, clusterTopicPath } from 'lib/paths';
import { ThemeProvider } from 'styled-components';
import theme from 'theme/theme';
import userEvent from '@testing-library/user-event';

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
        <ThemeProvider theme={theme}>
          <New />
        </ThemeProvider>
      </Provider>
    </Router>
  );

  it('validates form', async () => {
    const mockedHistory = createMemoryHistory();
    jest.spyOn(mockedHistory, 'push');
    render(setupComponent(mockedHistory));
    userEvent.click(screen.getByText('Send'));

    await waitFor(() => {
      expect(screen.getByText('name is a required field')).toBeInTheDocument();
    });
    await waitFor(() => {
      expect(mockedHistory.push).toBeCalledTimes(0);
    });
  });

  it('submits valid form', () => {
    const mockedHistory = createMemoryHistory({
      initialEntries: [clusterTopicNewPath(clusterName)],
    });
    jest.spyOn(mockedHistory, 'push');
    render(setupComponent());
    userEvent.type(screen.getByPlaceholderText('Topic Name'), topicName);
    userEvent.click(screen.getByText('Send'));
    waitFor(() => {
      expect(mockedHistory.location.pathname).toBe(
        clusterTopicPath(clusterName, topicName)
      );
    });
    waitFor(() => {
      expect(mockedHistory.push).toBeCalledTimes(1);
    });
  });
});
