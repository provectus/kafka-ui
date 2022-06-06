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
      <>
        <WithRoute path={clusterTopicSendMessagePath()}>
          <SendMessage />
        </WithRoute>
        <S.AlertsContainer role="toolbar">
          <Alerts />
        </S.AlertsContainer>
      </>,
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
    userEvent.click(screen.getByLabelText('Partition'));
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
      expect(mockNavigate).toHaveBeenLastCalledWith(
        `../${clusterTopicMessagesRelativePath}`
      );
    });

    it('should make the sendTopicMessage but most find an error within it', async () => {
      const sendTopicMessageMock = fetchMock.postOnce(url, {
        throws: 'Error',
      });
      await renderAndSubmitData();
      expect(sendTopicMessageMock.called(url)).toBeTruthy();
      expect(screen.getByRole('alert')).toBeInTheDocument();
      expect(mockNavigate).toHaveBeenLastCalledWith(
        `../${clusterTopicMessagesRelativePath}`
      );
    });

    it('should check and view validation error message when is not valid', async () => {
      const sendTopicMessageMock = fetchMock.postOnce(url, 200);
      await renderAndSubmitData(['error']);
      expect(sendTopicMessageMock.called(url)).toBeFalsy();
      expect(mockNavigate).not.toHaveBeenCalled();
    });
  });
});
