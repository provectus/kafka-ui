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

import { testSchema } from './fixtures';

jest.mock('json-schema-faker', () => ({
  generate: () => ({
    f1: -93251214,
    schema: 'enim sit in fugiat dolor',
    f2: 'deserunt culpa sunt',
  }),
  option: jest.fn(),
}));

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
    beforeEach(() => {
      fetchMock.getOnce(
        `/api/clusters/${clusterName}/topics/${topicName}/messages/schema`,
        testSchema
      );
    });

    it('calls sendTopicMessage on submit', async () => {
      const sendTopicMessageMock = fetchMock.postOnce(
        `/api/clusters/${clusterName}/topics/${topicName}/messages`,
        200
      );
      renderComponent();
      await waitForElementToBeRemoved(() => screen.getByRole('progressbar'));

      userEvent.selectOptions(screen.getByLabelText('Partition'), '0');
      await screen.findByText('Send');
      userEvent.click(screen.getByText('Send'));
      await waitFor(() => expect(sendTopicMessageMock.called()).toBeTruthy());
      expect(history.location.pathname).toEqual(
        clusterTopicMessagesPath(clusterName, topicName)
      );
    });
  });
});
