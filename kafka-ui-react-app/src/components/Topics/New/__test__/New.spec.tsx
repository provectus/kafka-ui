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
    await act(() => renderComponent(clusterTopicNewPath(clusterName)));
    await waitFor(async () => {
      await userEvent.type(
        screen.getByPlaceholderText('Topic Name'),
        topicName
      );
    });
    await waitFor(async () => {
      await userEvent.clear(screen.getByPlaceholderText('Topic Name'));
    });
    await waitFor(() => {
      expect(screen.getByText('name is a required field')).toBeInTheDocument();
    });
    expect(createTopicMock).not.toHaveBeenCalled();
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  it('validates form invalid name', async () => {
    await act(() => renderComponent(clusterTopicNewPath(clusterName)));
    await waitFor(() => {
      userEvent.type(screen.getByPlaceholderText('Topic Name'), 'Invalid,Name');
    });
    await waitFor(() => {
      expect(
        screen.getByText('Only alphanumeric, _, -, and . allowed')
      ).toBeInTheDocument();
    });
  });

  it('submits valid form', async () => {
    await act(() => renderComponent(clusterTopicNewPath(clusterName)));
    await act(async () => {
      await userEvent.type(
        screen.getByPlaceholderText('Topic Name'),
        topicName
      );
    });
    await act(async () => {
      await userEvent.click(screen.getByText('Create topic'));
    });
    await waitFor(() => expect(createTopicMock).toHaveBeenCalledTimes(1));
    await waitFor(() =>
      expect(mockNavigate).toHaveBeenLastCalledWith(`../${topicName}`)
    );
  });
});
