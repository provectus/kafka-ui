import React from 'react';
import Edit, { Props } from 'components/Topics/Topic/Edit/Edit';
import { screen } from '@testing-library/react';
import { render } from 'lib/testHelpers';

import { topicName, clusterName, topicWithInfo } from './fixtures';

const renderComponent = (props?: Partial<Props>) =>
  render(
    <Edit
      clusterName={clusterName}
      topicName={topicName}
      topic={topicWithInfo}
      isFetched
      isTopicUpdated={false}
      fetchTopicConfig={jest.fn()}
      updateTopic={jest.fn()}
      updateTopicPartitionsCount={jest.fn()}
      {...props}
    />
  );

describe('DangerZone', () => {
  it('renders', () => {
    renderComponent();

    expect(
      screen.getByRole('heading', { name: `Edit ${topicName}` })
    ).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { name: `Danger Zone` })
    ).toBeInTheDocument();
  });
});
