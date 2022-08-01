import React from 'react';
import SendMessage from 'components/Topics/Topic/SendMessage/SendMessage';
import { act, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import fetchMock from 'fetch-mock';
import { render, WithRoute } from 'lib/testHelpers';
import {
  clusterTopicMessagesRelativePath,
  clusterTopicSendMessagePath,
} from 'lib/paths';
import { store } from 'redux/store';
import { fetchTopicDetails } from 'redux/reducers/topics/topicsSlice';
import { externalTopicPayload } from 'redux/reducers/topics/__test__/fixtures';
import validateMessage from 'components/Topics/Topic/SendMessage/validateMessage';
import { showServerError } from 'lib/errorHandling';

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

jest.mock('lib/errorHandling', () => ({
  ...jest.requireActual('lib/errorHandling'),
  showServerError: jest.fn(),
}));

const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

const clusterName = 'testCluster';
const topicName = externalTopicPayload.name;

const renderComponent = async () => {
  await act(() => {
    render(
      <WithRoute path={clusterTopicSendMessagePath()}>
        <SendMessage />
      </WithRoute>,
      {
        initialEntries: [clusterTopicSendMessagePath(clusterName, topicName)],
        store,
      }
    );
  });
};

const renderAndSubmitData = async (error: string[] = []) => {
  await renderComponent();
  expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
  await act(() => {
    userEvent.click(screen.getByRole('listbox'));
  });
  await act(() => {
    userEvent.click(screen.getAllByRole('option')[1]);
  });
  await act(() => {
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
    mockNavigate.mockClear();
  });

  it('fetches schema on first render', async () => {
    const fetchTopicMessageSchemaMock = fetchMock.getOnce(
      `/api/clusters/${clusterName}/topics/${topicName}/messages/schema`,
      testSchema
    );
    await renderComponent();
    expect(fetchTopicMessageSchemaMock.called()).toBeTruthy();
  });

  describe('when schema is fetched', () => {
    const messagesUrl = `/api/clusters/${clusterName}/topics/${topicName}/messages`;
    const detailsUrl = `/api/clusters/${clusterName}/topics/${topicName}`;

    beforeEach(() => {
      fetchMock.getOnce(
        `/api/clusters/${clusterName}/topics/${topicName}/messages/schema`,
        testSchema
      );
    });

    it('calls sendTopicMessage on submit', async () => {
      const sendTopicMessageMock = fetchMock.postOnce(messagesUrl, 200);
      const fetchTopicDetailsMock = fetchMock.getOnce(detailsUrl, 200);
      await renderAndSubmitData();
      expect(sendTopicMessageMock.called(messagesUrl)).toBeTruthy();
      expect(fetchTopicDetailsMock.called(detailsUrl)).toBeTruthy();
      expect(mockNavigate).toHaveBeenLastCalledWith(
        `../${clusterTopicMessagesRelativePath}`
      );
    });

    it('should make the sendTopicMessage but most find an error within it', async () => {
      const showServerErrorMock = jest.fn();
      (showServerError as jest.Mock).mockImplementation(showServerErrorMock);
      const sendTopicMessageMock = fetchMock.postOnce(messagesUrl, {
        throws: 'Error',
      });
      const fetchTopicDetailsMock = fetchMock.getOnce(detailsUrl, 200);
      await renderAndSubmitData();
      expect(sendTopicMessageMock.called()).toBeTruthy();
      expect(fetchTopicDetailsMock.called(detailsUrl)).toBeFalsy();

      expect(showServerErrorMock).toHaveBeenCalledWith('Error', {
        id: 'testCluster-external.topic-sendTopicMessagesError',
        message: 'Error in sending a message to external.topic',
      });

      expect(mockNavigate).toHaveBeenLastCalledWith(
        `../${clusterTopicMessagesRelativePath}`
      );
    });

    it('should check and view validation error message when is not valid', async () => {
      const sendTopicMessageMock = fetchMock.postOnce(messagesUrl, 200);
      await renderAndSubmitData(['error']);
      expect(sendTopicMessageMock.called(messagesUrl)).toBeFalsy();
      expect(mockNavigate).not.toHaveBeenCalled();
    });
  });
});
