import React from 'react';
import SendMessage from 'components/Topics/Topic/SendMessage/SendMessage';
import {
  screen,
  waitFor,
  waitForElementToBeRemoved,
} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import fetchMock from 'fetch-mock';
import { createMemoryHistory } from 'history';
import { render } from 'lib/testHelpers';
import { Route, Router } from 'react-router';
import {
  clusterTopicMessagesPath,
  clusterTopicSendMessagePath,
} from 'lib/paths';
import { store } from 'redux/store';
import { fetchTopicDetailsAction } from 'redux/actions';
import { initialState } from 'redux/reducers/topics/reducer';
import { externalTopicPayload } from 'redux/reducers/topics/__test__/fixtures';
import validateMessage from 'components/Topics/Topic/SendMessage/validateMessage';

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

const renderComponent = () => {
  history.push(clusterTopicSendMessagePath(clusterName, topicName));
  render(
    <Router history={history}>
      <Route path={clusterTopicSendMessagePath(':clusterName', ':topicName')}>
        <SendMessage />
      </Route>
    </Router>,
    { store }
  );
};

const RenderAndSubmitData = async (error: string[] = []) => {
  renderComponent();
  await waitForElementToBeRemoved(() => screen.getByRole('progressbar'));

  userEvent.selectOptions(screen.getByLabelText('Partition'), '0');
  const sendBtn = await screen.findByText('Send');
  (validateMessage as Mock).mockImplementation(() => error);
  userEvent.click(sendBtn);
};

describe('SendMessage', () => {
  beforeAll(() => {
    store.dispatch(
      fetchTopicDetailsAction.success({
        ...initialState,
        byName: {
          [externalTopicPayload.name]: externalTopicPayload,
        },
      })
    );
  });
  afterEach(() => {
    fetchMock.reset();
  });

  it('fetches schema on first render', () => {
    const fetchTopicMessageSchemaMock = fetchMock.getOnce(
      `/api/clusters/${clusterName}/topics/${topicName}/messages/schema`,
      testSchema
    );
    renderComponent();
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
      await RenderAndSubmitData();

      await waitFor(() =>
        expect(sendTopicMessageMock.called(url)).toBeTruthy()
      );
      expect(history.location.pathname).toEqual(
        clusterTopicMessagesPath(clusterName, topicName)
      );
    });

    it('should make the sendTopicMessage but most find an error within it', async () => {
      const sendTopicMessageMock = fetchMock.postOnce(url, () => {
        return new Error('Something Went Wrong');
      });
      await RenderAndSubmitData();
      await waitFor(() => {
        expect(sendTopicMessageMock.called(url)).toBeTruthy();
      });
      expect(history.location.pathname).toEqual(
        clusterTopicMessagesPath(clusterName, topicName)
      );
    });

    it('should check and view validation error message when is not valid', async () => {
      const sendTopicMessageMock = fetchMock.postOnce(url, 200);
      await RenderAndSubmitData(['error']);

      await waitFor(() => expect(sendTopicMessageMock.called(url)).toBeFalsy());
      expect(history.location.pathname).not.toEqual(
        clusterTopicMessagesPath(clusterName, topicName)
      );
    });
  });
});
