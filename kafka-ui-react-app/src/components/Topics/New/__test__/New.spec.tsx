import React from 'react';
import New from 'components/Topics/New/New';
import { Route, Routes } from 'react-router-dom';
import { act, screen } from '@testing-library/react';
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
      createResource: createTopicMock,
    }));
  });
  it('checks header for create new', async () => {
    await act(() => {
      renderComponent(clusterTopicNewPath(clusterName));
    });
    expect(screen.getByRole('heading', { name: 'Create' })).toBeInTheDocument();
  });

  it('checks header for copy', async () => {
    await act(() => {
      renderComponent(`${clusterTopicCopyPath(clusterName)}?name=test`);
    });
    expect(screen.getByRole('heading', { name: 'Copy' })).toBeInTheDocument();
  });
  it('validates form', async () => {
    renderComponent(clusterTopicNewPath(clusterName));
    await userEvent.type(screen.getByPlaceholderText('Topic Name'), topicName);
    await userEvent.clear(screen.getByPlaceholderText('Topic Name'));
    await userEvent.tab();
    await expect(
      screen.getByText('Topic Name is required')
    ).toBeInTheDocument();
    await userEvent.type(
      screen.getByLabelText('Number of Partitions *'),
      minValue
    );
    await userEvent.clear(screen.getByLabelText('Number of Partitions *'));
    await userEvent.tab();
    await expect(
      screen.getByText('Number of Partitions is required and must be a number')
    ).toBeInTheDocument();

    expect(createTopicMock).not.toHaveBeenCalled();
    expect(mockNavigate).not.toHaveBeenCalled();
  });
  it('validates form invalid name', async () => {
    renderComponent(clusterTopicNewPath(clusterName));
    await userEvent.type(
      screen.getByPlaceholderText('Topic Name'),
      'Invalid,Name'
    );
    expect(
      screen.getByText('Only alphanumeric, _, -, and . allowed')
    ).toBeInTheDocument();
  });
  it('submits valid form', async () => {
    renderComponent(clusterTopicNewPath(clusterName));
    await userEvent.type(screen.getByPlaceholderText('Topic Name'), topicName);
    await userEvent.type(
      screen.getByLabelText('Number of Partitions *'),
      minValue
    );
    await userEvent.click(screen.getByText('Create topic'));
    expect(createTopicMock).toHaveBeenCalledTimes(1);
    expect(mockNavigate).toHaveBeenLastCalledWith(`../${topicName}`);
  });
});
