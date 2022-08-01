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
import { useAppDispatch } from 'lib/hooks/redux';

const clusterName = 'local';
const topicName = 'test-topic';

const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));
jest.mock('lib/hooks/redux', () => ({
  ...jest.requireActual('lib/hooks/redux'),
  useAppDispatch: jest.fn(),
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

describe('New', () => {
  afterEach(() => {
    mockNavigate.mockClear();
  });

  it('checks header for create new', async () => {
    await act(() => renderComponent(clusterTopicNewPath(clusterName)));

    expect(
      screen.getByRole('heading', { name: 'Create new Topic' })
    ).toHaveTextContent('Create new Topic');
  });

  it('checks header for copy', async () => {
    await act(() =>
      renderComponent(`${clusterTopicCopyPath(clusterName)}?name=test`)
    );
    expect(
      screen.getByRole('heading', { name: 'Copy Topic' })
    ).toHaveTextContent('Copy Topic');
  });

  it('validates form', async () => {
    await act(() => renderComponent(clusterTopicNewPath(clusterName)));
    await waitFor(() => {
      userEvent.type(screen.getByPlaceholderText('Topic Name'), topicName);
    });
    await waitFor(() => {
      userEvent.clear(screen.getByPlaceholderText('Topic Name'));
    });
    await waitFor(() => {
      expect(screen.getByText('name is a required field')).toBeInTheDocument();
    });
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  it('submits valid form', async () => {
    const useDispatchMock = jest.fn(() => ({
      meta: { requestStatus: 'fulfilled' },
    }));
    (useAppDispatch as jest.Mock).mockImplementation(() => useDispatchMock);

    await act(() => renderComponent(clusterTopicNewPath(clusterName)));
    await act(() => {
      userEvent.type(screen.getByPlaceholderText('Topic Name'), topicName);
    });
    await act(() => {
      userEvent.click(screen.getByText('Create topic'));
    });
    await waitFor(() => expect(useDispatchMock).toHaveBeenCalledTimes(1));
    await waitFor(() =>
      expect(mockNavigate).toHaveBeenLastCalledWith(`../${topicName}`)
    );
  });

  it('does not redirect page when request is not fulfilled', async () => {
    const useDispatchMock = jest.fn(() => ({
      meta: { requestStatus: 'pending' },
    }));
    (useAppDispatch as jest.Mock).mockImplementation(() => useDispatchMock);
    await act(() => renderComponent(clusterTopicNewPath(clusterName)));
    await act(() =>
      userEvent.type(screen.getByPlaceholderText('Topic Name'), topicName)
    );
    await act(() => userEvent.click(screen.getByText('Create topic')));
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  it('submits valid form that result in an error', async () => {
    const useDispatchMock = jest.fn();
    (useAppDispatch as jest.Mock).mockImplementation(() => useDispatchMock);

    await act(() => renderComponent(clusterTopicNewPath(clusterName)));
    await act(() => {
      userEvent.type(screen.getByPlaceholderText('Topic Name'), topicName);
    });
    await act(() => {
      userEvent.click(screen.getByText('Create topic'));
    });

    expect(useDispatchMock).toHaveBeenCalledTimes(1);
    expect(mockNavigate).not.toHaveBeenCalled();
  });
});
