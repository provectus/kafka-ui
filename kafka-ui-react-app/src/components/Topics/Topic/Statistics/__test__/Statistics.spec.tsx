import React from 'react';
import { screen } from '@testing-library/react';
import { render, WithRoute } from 'lib/testHelpers';
import Statistics from 'components/Topics/Topic/Statistics/Statistics';
import { clusterTopicStatisticsPath } from 'lib/paths';
import { useTopicAnalysis } from 'lib/hooks/api/topics';

const clusterName = 'local';
const topicName = 'topic';

jest.mock('lib/hooks/api/topics', () => ({
  ...jest.requireActual('lib/hooks/api/topics'),
  useTopicAnalysis: jest.fn(),
}));

describe('Statistics', () => {
  const renderComponent = () => {
    const path = clusterTopicStatisticsPath(clusterName, topicName);
    return render(
      <WithRoute path={clusterTopicStatisticsPath()}>
        <Statistics />
      </WithRoute>,
      { initialEntries: [path] }
    );
  };

  it('renders Metricks component', () => {
    (useTopicAnalysis as jest.Mock).mockImplementation(() => ({
      data: { result: 1 },
    }));

    renderComponent();
    expect(screen.getByText('Restart Analysis')).toBeInTheDocument();
  });
});
