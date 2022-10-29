import React from 'react';
import SendMessage from 'components/Topics/Topic/SendMessage/SendMessage';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { render, WithRoute } from 'lib/testHelpers';
import { clusterTopicPath } from 'lib/paths';
import { validateBySchema } from 'components/Topics/Topic/SendMessage/utils';
import { externalTopicPayload } from 'lib/fixtures/topics';
import { useSendMessage, useTopicDetails } from 'lib/hooks/api/topics';
import { useSerdes } from 'lib/hooks/api/topicMessages';
import { serdesPayload } from 'lib/fixtures/topicMessages';

import Mock = jest.Mock;

jest.mock('json-schema-faker', () => ({
  generate: () => ({
    f1: -93251214,
    schema: 'enim sit in fugiat dolor',
    f2: 'deserunt culpa sunt',
  }),
  option: jest.fn(),
}));

jest.mock('components/Topics/Topic/SendMessage/utils', () => ({
  ...jest.requireActual('components/Topics/Topic/SendMessage/utils'),
  validateBySchema: jest.fn(),
}));

jest.mock('lib/errorHandling', () => ({
  ...jest.requireActual('lib/errorHandling'),
  showServerError: jest.fn(),
}));

jest.mock('lib/hooks/api/topics', () => ({
  useTopicDetails: jest.fn(),
  useSendMessage: jest.fn(),
}));

jest.mock('lib/hooks/api/topicMessages', () => ({
  useSerdes: jest.fn(),
}));

const clusterName = 'testCluster';
const topicName = externalTopicPayload.name;

const mockOnSubmit = jest.fn();

const renderComponent = async () => {
  const path = clusterTopicPath(clusterName, topicName);
  await render(
    <WithRoute path={clusterTopicPath()}>
      <SendMessage onSubmit={mockOnSubmit} />
    </WithRoute>,
    { initialEntries: [path] }
  );
};

const renderAndSubmitData = async (error: string[] = []) => {
  await renderComponent();
  await userEvent.click(screen.getAllByRole('listbox')[0]);

  await userEvent.click(screen.getAllByRole('option')[1]);

  (validateBySchema as Mock).mockImplementation(() => error);
  const submitButton = screen.getByRole('button', {
    name: 'Produce Message',
  });
  await waitFor(() => expect(submitButton).toBeEnabled());
  await userEvent.click(submitButton);
};

describe('SendMessage', () => {
  beforeEach(() => {
    (useTopicDetails as jest.Mock).mockImplementation(() => ({
      data: externalTopicPayload,
    }));
    (useSerdes as jest.Mock).mockImplementation(() => ({
      data: serdesPayload,
    }));
  });

  describe('when schema is fetched', () => {
    it('calls sendTopicMessage on submit', async () => {
      const sendTopicMessageMock = jest.fn();
      (useSendMessage as jest.Mock).mockImplementation(() => ({
        mutateAsync: sendTopicMessageMock,
      }));
      await renderAndSubmitData();
      expect(sendTopicMessageMock).toHaveBeenCalledTimes(1);
      expect(mockOnSubmit).toHaveBeenCalledTimes(1);
    });

    it('should check and view validation error message when is not valid', async () => {
      const sendTopicMessageMock = jest.fn();
      (useSendMessage as jest.Mock).mockImplementation(() => ({
        mutateAsync: sendTopicMessageMock,
      }));
      await renderAndSubmitData(['error']);
      expect(sendTopicMessageMock).not.toHaveBeenCalled();
      expect(mockOnSubmit).not.toHaveBeenCalled();
    });
  });

  describe('when schema is empty', () => {
    it('renders if schema is not defined', async () => {
      await renderComponent();
      expect(screen.getAllByRole('textbox')[0].nodeValue).toBeNull();
    });
  });
});
