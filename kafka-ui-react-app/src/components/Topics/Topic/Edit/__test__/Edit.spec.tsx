import React from 'react';
import Edit, { DEFAULTS, Props } from 'components/Topics/Topic/Edit/Edit';
import { screen, waitFor } from '@testing-library/react';
import { render } from 'lib/testHelpers';
import userEvent from '@testing-library/user-event';
import { Router } from 'react-router-dom';
import { createMemoryHistory } from 'history';
import { clusterTopicPath, clusterTopicsPath } from 'lib/paths';

import { topicName, clusterName, topicWithInfo } from './fixtures';

const historyMock = createMemoryHistory();

const renderComponent = (props: Partial<Props> = {}, history = historyMock) =>
  render(
    <Router history={history}>
      <Edit
        clusterName={props.clusterName || clusterName}
        topicName={props.topicName || topicName}
        topic={'topic' in props ? props.topic : topicWithInfo}
        isFetched={'isFetched' in props ? !!props.isFetched : true}
        isTopicUpdated={
          'isTopicUpdated' in props ? !!props.isTopicUpdated : false
        }
        fetchTopicConfig={jest.fn()}
        updateTopic={props.updateTopic || jest.fn()}
        updateTopicPartitionsCount={
          props.updateTopicPartitionsCount || jest.fn()
        }
        {...props}
      />
    </Router>
  );

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
    renderComponent({ topic: undefined });
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
    renderComponent({ topic: modifiedTopic });
    expect(
      screen.queryByRole('heading', { name: `Edit ${topicName}` })
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole('heading', { name: `Danger Zone` })
    ).not.toBeInTheDocument();
  });

  describe('Edit Component with its topic default and modified values', () => {
    it('should check the default partitions value in the DangerZone', () => {
      renderComponent({
        topic: { ...topicWithInfo, partitionCount: undefined },
      });
      expect(screen.getByPlaceholderText('Number of partitions')).toHaveValue(
        DEFAULTS.partitions
      );
    });

    it('should check the default partitions value in the DangerZone', () => {
      renderComponent({
        topic: { ...topicWithInfo, replicationFactor: undefined },
      });
      expect(screen.getByPlaceholderText('Replication Factor')).toHaveValue(
        DEFAULTS.replicationFactor
      );
    });
  });

  describe('Submit Case of the Edit Component', () => {
    it('should check the submit functionality when topic updated is false', async () => {
      const updateTopicMock = jest.fn();
      const mocked = createMemoryHistory({
        initialEntries: [`${clusterTopicsPath(clusterName)}/${topicName}/edit`],
      });

      jest.spyOn(mocked, 'push');
      renderComponent({ updateTopic: updateTopicMock }, mocked);

      const btn = screen.getAllByText(/submit/i)[0];
      expect(btn).toBeEnabled();

      await waitFor(() => {
        userEvent.type(
          screen.getByPlaceholderText('Min In Sync Replicas'),
          '1'
        );
        userEvent.click(btn);
      });
      expect(updateTopicMock).toHaveBeenCalledTimes(1);
      await waitFor(() => {
        expect(mocked.push).not.toHaveBeenCalled();
      });
    });

    it('should check the submit functionality when topic updated is true', async () => {
      const updateTopicMock = jest.fn();
      const mocked = createMemoryHistory({
        initialEntries: [`${clusterTopicsPath(clusterName)}/${topicName}/edit`],
      });
      jest.spyOn(mocked, 'push');
      renderComponent(
        { updateTopic: updateTopicMock, isTopicUpdated: true },
        mocked
      );

      const btn = screen.getAllByText(/submit/i)[0];

      await waitFor(() => {
        userEvent.type(
          screen.getByPlaceholderText('Min In Sync Replicas'),
          '1'
        );
        userEvent.click(btn);
      });
      expect(updateTopicMock).toHaveBeenCalledTimes(1);
      await waitFor(() => {
        expect(mocked.push).toHaveBeenCalled();
        expect(mocked.location.pathname).toBe(
          clusterTopicPath(clusterName, topicName)
        );
      });
    });
  });
});
