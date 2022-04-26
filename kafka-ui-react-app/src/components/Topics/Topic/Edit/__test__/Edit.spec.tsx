import React from 'react';
import Edit, { Props } from 'components/Topics/Topic/Edit/Edit';
import { screen } from '@testing-library/react';
import { render } from 'lib/testHelpers';

import { topicName, clusterName, topicWithInfo } from './fixtures';

const renderComponent = (props: Partial<Props> = {}) =>
  render(
    <Edit
      clusterName={props.clusterName || clusterName}
      topicName={props.topicName || topicName}
      topic={'topic' in props ? props.topic : topicWithInfo}
      isFetched={'isFetched' in props ? !!props.isFetched : true}
      isTopicUpdated={false}
      fetchTopicConfig={jest.fn()}
      updateTopic={props.updateTopic || jest.fn()}
      updateTopicPartitionsCount={props.updateTopicPartitionsCount || jest.fn()}
      {...props}
    />
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
});
