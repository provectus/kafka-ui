import React from 'react';
import Edit from 'components/Topics/Topic/Edit/Edit';
import { screen } from '@testing-library/react';
import { render, WithRoute } from 'lib/testHelpers';
import userEvent from '@testing-library/user-event';
import { clusterTopicEditPath } from 'lib/paths';
import {
  useTopicConfig,
  useTopicDetails,
  useUpdateTopic,
  useIncreaseTopicPartitionsCount,
  useUpdateTopicReplicationFactor,
} from 'lib/hooks/api/topics';
import { internalTopicPayload, topicConfigPayload } from 'lib/fixtures/topics';

const clusterName = 'testCluster';
const topicName = 'testTopic';

const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

jest.mock('lib/hooks/api/topics', () => ({
  useTopicDetails: jest.fn(),
  useTopicConfig: jest.fn(),
  useUpdateTopic: jest.fn(),
  useIncreaseTopicPartitionsCount: jest.fn(),
  useUpdateTopicReplicationFactor: jest.fn(),
}));

const updateTopicMock = jest.fn();

const renderComponent = () => {
  const path = clusterTopicEditPath(clusterName, topicName);
  return render(
    <WithRoute path={clusterTopicEditPath()}>
      <Edit />
    </WithRoute>,
    { initialEntries: [path] }
  );
};

describe('Edit Component', () => {
  beforeEach(() => {
    (useTopicDetails as jest.Mock).mockImplementation(() => ({
      data: internalTopicPayload,
    }));
    (useTopicConfig as jest.Mock).mockImplementation(() => ({
      data: topicConfigPayload,
    }));
    (useUpdateTopic as jest.Mock).mockImplementation(() => ({
      isLoading: false,
      mutateAsync: updateTopicMock,
    }));
    (useIncreaseTopicPartitionsCount as jest.Mock).mockImplementation(() => ({
      isLoading: false,
      mutateAsync: {},
    }));
    (useUpdateTopicReplicationFactor as jest.Mock).mockImplementation(() => ({
      isLoading: false,
      mutateAsync: {},
    }));
    renderComponent();
  });

  it('renders DangerZone component', () => {
    expect(screen.getByText(`Danger Zone`)).toBeInTheDocument();
  });

  it('submits form correctly', async () => {
    const btn = screen.getAllByText(/Update topic/i)[0];
    const field = screen.getByRole('button', {
      name: '1 day',
    });
    await userEvent.click(field);
    await userEvent.click(btn);
    expect(updateTopicMock).toHaveBeenCalledTimes(1);
    expect(mockNavigate).toHaveBeenCalledWith('../');
  });
});
