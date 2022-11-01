import React from 'react';
import New from 'components/Topics/New/New';
import { Route, Routes } from 'react-router-dom';
import { act, screen, waitFor } from '@testing-library/react';
import {
  clusterTopicCopyPath,
  clusterTopicNewPath,
  clusterTopicPath,
} from 'lib/paths';
import userEvent from '@testing-library/user-event';
import { render } from 'lib/testHelpers';
import { useCreateTopic } from 'lib/hooks/api/topics';

const clusterName = 'local';
const topicName = 'test-topic';
const retainTime = '2419200000';
const minValue = '1';

const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));
jest.mock('lib/hooks/api/topics', () => ({
  useCreateTopic: jest.fn(),
}));
const renderComponent = (path: string) => {
  render(
    <Routes>
      <Route path={clusterTopicNewPath()} element={<New />} />
      <Route path={clusterTopicCopyPath()} element={<New />} />
      <Route path={clusterTopicPath()} element="New topic path" />
    </Routes>,
    { initialEntries: [path] }
  );
};
const createTopicMock = jest.fn();
describe('New', () => {
  beforeEach(() => {
    (useCreateTopic as jest.Mock).mockImplementation(() => ({
      mutateAsync: createTopicMock,
    }));
  });
  afterEach(() => {
    mockNavigate.mockClear();
  });
  it('checks header for create new', async () => {
    await act(() => renderComponent(clusterTopicNewPath(clusterName)));
    expect(screen.getByRole('heading', { name: 'Create' })).toBeInTheDocument();
  });
  it('checks header for copy', async () => {
    await act(() =>
      renderComponent(`${clusterTopicCopyPath(clusterName)}?name=test`)
    );
    expect(screen.getByRole('heading', { name: 'Copy' })).toBeInTheDocument();
  });
  it('validates form', async () => {
    await renderComponent(clusterTopicNewPath(clusterName));
    await userEvent.type(screen.getByPlaceholderText('Topic Name'), topicName);
    await userEvent.clear(screen.getByPlaceholderText('Topic Name'));
    await userEvent.tab();
    await expect(
      screen.getByText('name is a required field')
    ).toBeInTheDocument();

    await userEvent.type(
      screen.getByLabelText('Number of partitions *'),
      minValue
    );
    await userEvent.clear(screen.getByLabelText('Number of partitions *'));
    await userEvent.tab();
    await expect(
      screen.getByText('Number of partitions is required and must be a number')
    ).toBeInTheDocument();

    await userEvent.type(
      screen.getByLabelText('Min In Sync Replicas *'),
      minValue
    );
    await userEvent.clear(screen.getByLabelText('Min In Sync Replicas *'));
    await userEvent.tab();
    await expect(
      screen.getByText('Min in sync replicas is required and must be a number')
    ).toBeInTheDocument();

    await userEvent.type(
      screen.getByLabelText('Replication Factor *'),
      minValue
    );
    await userEvent.clear(screen.getByLabelText('Replication Factor *'));
    await userEvent.tab();
    await expect(
      screen.getByText('Replication factor is required and must be a number')
    ).toBeInTheDocument();

    await userEvent.type(
      screen.getByLabelText('Time to retain data (in ms)'),
      retainTime
    );
    await userEvent.clear(screen.getByLabelText('Time to retain data (in ms)'));
    await userEvent.tab();
    await expect(
      screen.getByText('Time to retain data is required and must be a number')
    ).toBeInTheDocument();

    await userEvent.type(
      screen.getByLabelText('Maximum message size in bytes *'),
      minValue
    );
    await userEvent.clear(
      screen.getByLabelText('Maximum message size in bytes *')
    );
    await userEvent.tab();
    await expect(
      screen.getByText('Maximum message size is required and must be a number')
    ).toBeInTheDocument();

    expect(createTopicMock).not.toHaveBeenCalled();
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  it('validates form invalid name', async () => {
    await renderComponent(clusterTopicNewPath(clusterName));
    await userEvent.type(
      screen.getByPlaceholderText('Topic Name'),
      'Invalid,Name'
    );
    await expect(
      screen.getByText('Only alphanumeric, _, -, and . allowed')
    ).toBeInTheDocument();
  });

  it('submits valid form', async () => {
    await renderComponent(clusterTopicNewPath(clusterName));
    await userEvent.type(screen.getByLabelText('Topic Name *'), topicName);
    await userEvent.type(
      screen.getByLabelText('Number of partitions *'),
      minValue
    );
    await userEvent.type(
      screen.getByLabelText('Min In Sync Replicas *'),
      minValue
    );
    await userEvent.type(
      screen.getByLabelText('Replication Factor *'),
      minValue
    );
    await userEvent.type(
      screen.getByLabelText('Time to retain data (in ms)'),
      retainTime
    );
    await userEvent.type(
      screen.getByLabelText('Maximum message size in bytes *'),
      minValue
    );
    expect(screen.getByText('Create topic')).toBeEnabled();
    await userEvent.click(screen.getByText('Create topic'));
    await waitFor(() => expect(createTopicMock).toHaveBeenCalledTimes(1));
    await waitFor(() =>
      expect(mockNavigate).toHaveBeenCalledWith(`../${topicName}`)
    );
  });
});
