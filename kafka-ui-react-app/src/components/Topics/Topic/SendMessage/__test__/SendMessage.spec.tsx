import React from 'react';
import SendMessage from 'components/Topics/Topic/SendMessage/SendMessage';
import { act, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import fetchMock from 'fetch-mock';
import { createMemoryHistory } from 'history';
import { render } from 'lib/testHelpers';
import { Route, Router } from 'react-router-dom';
import {
  clusterTopicMessagesPath,
  clusterTopicSendMessagePath,
} from 'lib/paths';
import { store } from 'redux/store';
import { fetchTopicDetails } from 'redux/reducers/topics/topicsSlice';
import { externalTopicPayload } from 'redux/reducers/topics/__test__/fixtures';
import validateMessage from 'components/Topics/Topic/SendMessage/validateMessage';
import Alerts from 'components/Alerts/Alerts';
import * as S from 'components/App.styled';

import { testSchema } from './fixtures';

import Mock = jest.Mock;

jest.mock('json-schema-faker', () => ({
  generate: () => ({
    f1: -93251214,
    schema: 'enim sit in fugiat dolor',
    f2: 'deserunt culpa sunt',
  }),
  option: jest.fn(),
}));

jest.mock('components/Topics/Topic/SendMessage/validateMessage', () =>
  jest.fn()
);

const clusterName = 'testCluster';
const topicName = externalTopicPayload.name;
const history = createMemoryHistory();

const renderComponent = async () => {
  history.push(clusterTopicSendMessagePath(clusterName, topicName));
  await act(() => {
    render(
      <>
        <Router history={history}>
          <Route
            path={clusterTopicSendMessagePath(':clusterName', ':topicName')}
          >
            <SendMessage />
          </Route>
        </Router>
        <S.AlertsContainer role="toolbar">
          <Alerts />
        </S.AlertsContainer>
      </>,
      { store }
    );
  });
};

const renderAndSubmitData = async (error: string[] = []) => {
  await renderComponent();
  expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
  await act(() => {
    userEvent.selectOptions(screen.getByLabelText('Partition'), '0');
    (validateMessage as Mock).mockImplementation(() => error);
    userEvent.click(screen.getByText('Send'));
  });
};

describe('SendMessage', () => {
  beforeAll(() => {
    store.dispatch(
      fetchTopicDetails.fulfilled(
        {
          topicDetails: externalTopicPayload,
          topicName,
        },
        'topic',
        {
          clusterName,
          topicName,
        }
      )
    );
  });
  afterEach(() => {
    fetchMock.reset();
  });

  it('fetches schema on first render', async () => {
    const fetchTopicMessageSchemaMock = fetchMock.getOnce(
      `/api/clusters/${clusterName}/topics/${topicName}/messages/schema`,
      testSchema
    );
    await act(() => {
      renderComponent();
    });
    expect(fetchTopicMessageSchemaMock.called()).toBeTruthy();
  });

  describe('when schema is fetched', () => {
    const url = `/api/clusters/${clusterName}/topics/${topicName}/messages`;

    beforeEach(() => {
      fetchMock.getOnce(
        `/api/clusters/${clusterName}/topics/${topicName}/messages/schema`,
        testSchema
      );
    });

    it('calls sendTopicMessage on submit', async () => {
      const sendTopicMessageMock = fetchMock.postOnce(url, 200);
      await renderAndSubmitData();
      expect(sendTopicMessageMock.called(url)).toBeTruthy();
      expect(history.location.pathname).toEqual(
        clusterTopicMessagesPath(clusterName, topicName)
      );
    });

    it('should make the sendTopicMessage but most find an error within it', async () => {
      const sendTopicMessageMock = fetchMock.postOnce(url, {
        throws: 'Error',
      });
      await renderAndSubmitData();
      expect(sendTopicMessageMock.called(url)).toBeTruthy();
      expect(screen.getByRole('alert')).toBeInTheDocument();
      expect(history.location.pathname).toEqual(
        clusterTopicMessagesPath(clusterName, topicName)
      );
    });

    it('should check and view validation error message when is not valid', async () => {
      const sendTopicMessageMock = fetchMock.postOnce(url, 200);
      await renderAndSubmitData(['error']);
      expect(sendTopicMessageMock.called(url)).toBeFalsy();
      expect(history.location.pathname).not.toEqual(
        clusterTopicMessagesPath(clusterName, topicName)
      );
    });
  });
});
