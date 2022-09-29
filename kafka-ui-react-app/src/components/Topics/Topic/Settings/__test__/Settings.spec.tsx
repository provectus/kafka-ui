import React from 'react';
import { render, WithRoute } from 'lib/testHelpers';
import { screen } from '@testing-library/react';
import Settings from 'components/Topics/Topic/Settings/Settings';
import { clusterTopicSettingsPath } from 'lib/paths';
import { topicConfigPayload } from 'lib/fixtures/topics';
import { useTopicConfig } from 'lib/hooks/api/topics';

const clusterName = 'Cluster_Name';
const topicName = 'Topic_Name';

jest.mock('lib/hooks/api/topics', () => ({
  useTopicConfig: jest.fn(),
}));

jest.mock('components/Topics/Topic/Settings/ConfigListItem', () => () => (
  <tr>
    <td>ConfigListItemMock</td>
  </tr>
));

describe('Settings', () => {
  const renderComponent = () => {
    const path = clusterTopicSettingsPath(clusterName, topicName);
    return render(
      <WithRoute path={clusterTopicSettingsPath()}>
        <Settings />
      </WithRoute>,
      { initialEntries: [path] }
    );
  };

  beforeEach(() => {
    (useTopicConfig as jest.Mock).mockImplementation(() => ({
      data: topicConfigPayload,
    }));
    renderComponent();
  });

  it('should check it returns null if no config is passed', () => {
    expect(screen.getByRole('table')).toBeInTheDocument();
    const items = screen.getAllByText('ConfigListItemMock');
    expect(items.length).toEqual(topicConfigPayload.length);
  });
});
