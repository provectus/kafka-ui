import React from 'react';
import {
  clusterConsumerGroupDetailsPath,
  clusterConsumerGroupResetOffsetsPath,
  clusterConsumerGroupsPath,
  getNonExactPath,
} from 'lib/paths';
import { screen } from '@testing-library/react';
import ConsumerGroups from 'components/ConsumerGroups/ConsumerGroups';
import { render, WithRoute } from 'lib/testHelpers';

const clusterName = 'cluster1';

jest.mock('components/ConsumerGroups/List', () => () => <div>ListPage</div>);
jest.mock('components/ConsumerGroups/Details/Details', () => () => (
  <div>DetailsMock</div>
));
jest.mock(
  'components/ConsumerGroups/Details/ResetOffsets/ResetOffsets',
  () => () => <div>ResetOffsetsMock</div>
);

const renderComponent = (path?: string) =>
  render(
    <WithRoute path={getNonExactPath(clusterConsumerGroupsPath())}>
      <ConsumerGroups />
    </WithRoute>,
    {
      initialEntries: [path || clusterConsumerGroupsPath(clusterName)],
    }
  );

describe('ConsumerGroups', () => {
  it('renders ListContainer', async () => {
    renderComponent();
    expect(screen.getByText('ListPage')).toBeInTheDocument();
  });
  it('renders ResetOffsets', async () => {
    renderComponent(
      clusterConsumerGroupResetOffsetsPath(clusterName, 'groupId1')
    );
    expect(screen.getByText('ResetOffsetsMock')).toBeInTheDocument();
  });
  it('renders Details', async () => {
    renderComponent(clusterConsumerGroupDetailsPath(clusterName, 'groupId1'));
    expect(screen.getByText('DetailsMock')).toBeInTheDocument();
  });
});
