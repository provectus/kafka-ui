import React from 'react';
import SendMessage from 'components/Topics/Topic/SendMessage/SendMessage';
import { act, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { render, WithRoute } from 'lib/testHelpers';
import {
  clusterTopicMessagesRelativePath,
  clusterTopicSendMessagePath,
} from 'lib/paths';
import validateMessage from 'components/Topics/Topic/SendMessage/validateMessage';
import { externalTopicPayload, topicMessageSchema } from 'lib/fixtures/topics';
import {
  useSendMessage,
  useMessageSerdes,
  useTopicDetails,
} from 'lib/hooks/api/topics';

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

jest.mock('lib/hooks/api/topics', () => ({
  useTopicDetails: jest.fn(),
  useMessageSerdes: jest.fn(),
  useSendMessage: jest.fn(),
}));

const clusterName = 'testCluster';
const topicName = externalTopicPayload.name;

const renderComponent = async () => {
  const path = clusterTopicSendMessagePath(clusterName, topicName);
  await act(() => {
    render(
      <WithRoute path={clusterTopicSendMessagePath()}>
        <SendMessage />
      </WithRoute>,
      { initialEntries: [path] }
    );
  });
};

const renderAndSubmitData = async (error: string[] = []) => {
  await renderComponent();
  await act(() => {
    userEvent.click(screen.getAllByRole('listbox')[0]);
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
  beforeEach(() => {
    (useTopicDetails as jest.Mock).mockImplementation(() => ({
      data: externalTopicPayload,
    }));
  });

  afterEach(() => {
    mockNavigate.mockClear();
  });

  describe('when schema is fetched', () => {
    beforeEach(() => {
      (useMessageSerdes as jest.Mock).mockImplementation(() => ({
        key: [topicMessageSchema.key],
        value: [topicMessageSchema.value],
      }));
    });

    it('calls sendTopicMessage on submit', async () => {
      const sendTopicMessageMock = jest.fn();
      (useSendMessage as jest.Mock).mockImplementation(() => ({
        mutateAsync: sendTopicMessageMock,
      }));
      await renderAndSubmitData();
      expect(sendTopicMessageMock).toHaveBeenCalledTimes(1);
      expect(mockNavigate).toHaveBeenLastCalledWith(
        `../${clusterTopicMessagesRelativePath}`
      );
    });

    it('should check and view validation error message when is not valid', async () => {
      const sendTopicMessageMock = jest.fn();
      (useSendMessage as jest.Mock).mockImplementation(() => ({
        mutateAsync: sendTopicMessageMock,
      }));
      await renderAndSubmitData(['error']);
      expect(sendTopicMessageMock).not.toHaveBeenCalled();
      expect(mockNavigate).not.toHaveBeenCalled();
    });
  });

  describe('when schema is empty', () => {
    beforeEach(() => {
      (useMessageSerdes as jest.Mock).mockImplementation(() => ({
        data: undefined,
      }));
    });
    it('renders if schema is not defined', async () => {
      await renderComponent();
      expect(screen.getAllByRole('textbox')[0].nodeValue).toBeNull();
    });
  });
});
