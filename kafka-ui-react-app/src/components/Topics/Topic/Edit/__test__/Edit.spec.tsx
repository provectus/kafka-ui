import React from 'react';
import Edit, { DEFAULTS, Props } from 'components/Topics/Topic/Edit/Edit';
import { act, screen } from '@testing-library/react';
import { render } from 'lib/testHelpers';
import userEvent from '@testing-library/user-event';
import { Route, Router } from 'react-router-dom';
import { createMemoryHistory } from 'history';
import {
  clusterTopicEditPath,
  clusterTopicPath,
  clusterTopicsPath,
} from 'lib/paths';
import { TopicsState, TopicWithDetailedInfo } from 'redux/interfaces';
import { getTopicStateFixtures } from 'redux/reducers/topics/__test__/fixtures';

import { topicName, clusterName, topicWithInfo } from './fixtures';

const defaultPathName = clusterTopicEditPath(clusterName, topicName);

const historyMock = createMemoryHistory({
  initialEntries: [defaultPathName],
});

const renderComponent = (
  props: Partial<Props> = {},
  topic: TopicWithDetailedInfo | null = topicWithInfo,
  history = historyMock
) => {
  let topics: TopicsState | undefined;

  if (topic === null) {
    topics = undefined;
  } else {
    topics = getTopicStateFixtures([topic]);
  }

  return render(
    <Router history={history}>
      <Route path={clusterTopicEditPath()}>
        <Edit
          isFetched
          isTopicUpdated={false}
          fetchTopicConfig={jest.fn()}
          updateTopic={jest.fn()}
          {...props}
        />
      </Route>
    </Router>,
    {
      pathname: defaultPathName,
      preloadedState: { topics },
    }
  );
};

describe('Edit Component', () => {
  it('renders the Edit Component', () => {
    renderComponent();

    expect(
      screen.getByRole('heading', { name: `Edit ${topicName}` })
    ).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { name: `Danger Zone` })
    ).toBeInTheDocument();
  });

  it('should check Edit component renders null is not rendered when topic is not passed', () => {
    renderComponent({}, { ...topicWithInfo, config: undefined });
    expect(
      screen.queryByRole('heading', { name: `Edit ${topicName}` })
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole('heading', { name: `Danger Zone` })
    ).not.toBeInTheDocument();
  });

  it('should check Edit component renders null is not isFetched is false', () => {
    renderComponent({ isFetched: false });
    expect(
      screen.queryByRole('heading', { name: `Edit ${topicName}` })
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole('heading', { name: `Danger Zone` })
    ).not.toBeInTheDocument();
  });

  it('should check Edit component renders null is not topic config is not passed is false', () => {
    const modifiedTopic = { ...topicWithInfo };
    modifiedTopic.config = undefined;
    renderComponent({}, modifiedTopic);
    expect(
      screen.queryByRole('heading', { name: `Edit ${topicName}` })
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole('heading', { name: `Danger Zone` })
    ).not.toBeInTheDocument();
  });

  describe('Edit Component with its topic default and modified values', () => {
    it('should check the default partitions value in the DangerZone', async () => {
      renderComponent({}, { ...topicWithInfo, partitionCount: 0 });
      // cause topic selector will return falsy
      expect(
        screen.queryByRole('heading', { name: `Edit ${topicName}` })
      ).not.toBeInTheDocument();
      expect(
        screen.queryByRole('heading', { name: `Danger Zone` })
      ).not.toBeInTheDocument();
    });

    it('should check the default partitions value in the DangerZone', async () => {
      renderComponent({}, { ...topicWithInfo, replicationFactor: undefined });
      expect(screen.getByPlaceholderText('Replication Factor')).toHaveValue(
        DEFAULTS.replicationFactor
      );
    });
  });

  describe('Submit Case of the Edit Component', () => {
    it('should check the submit functionality when topic updated is false', async () => {
      const updateTopicMock = jest.fn();
      const mocked = createMemoryHistory({
        initialEntries: [clusterTopicEditPath(clusterName, topicName)],
      });

      jest.spyOn(mocked, 'push');
      renderComponent({ updateTopic: updateTopicMock }, undefined, mocked);

      const btn = screen.getAllByText(/submit/i)[0];
      expect(btn).toBeEnabled();

      await act(() => {
        userEvent.type(
          screen.getByPlaceholderText('Min In Sync Replicas'),
          '1'
        );
        userEvent.click(btn);
      });
      expect(updateTopicMock).toHaveBeenCalledTimes(1);
      expect(mocked.push).not.toHaveBeenCalled();
    });

    it('should check the submit functionality when topic updated is true', async () => {
      const updateTopicMock = jest.fn();
      const mocked = createMemoryHistory({
        initialEntries: [`${clusterTopicsPath(clusterName)}/${topicName}/edit`],
      });
      jest.spyOn(mocked, 'push');
      renderComponent(
        { updateTopic: updateTopicMock, isTopicUpdated: true },
        undefined,
        mocked
      );

      const btn = screen.getAllByText(/submit/i)[0];

      await act(() => {
        userEvent.type(
          screen.getByPlaceholderText('Min In Sync Replicas'),
          '1'
        );
        userEvent.click(btn);
      });
      expect(updateTopicMock).toHaveBeenCalledTimes(1);
      expect(mocked.push).toHaveBeenCalled();
      expect(mocked.location.pathname).toBe(
        clusterTopicPath(clusterName, topicName)
      );
    });
  });
});
