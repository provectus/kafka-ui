import React from 'react';
import { screen, waitFor } from '@testing-library/react';
import { render, WithRoute } from 'lib/testHelpers';
import Statistics from 'components/Topics/Topic/Statistics/Statistics';
import { clusterTopicStatisticsPath } from 'lib/paths';
import { useTopicAnalysis, useAnalyzeTopic } from 'lib/hooks/api/topics';
import userEvent from '@testing-library/user-event';

const clusterName = 'local';
const topicName = 'topic';

jest.mock('lib/hooks/api/topics', () => ({
  ...jest.requireActual('lib/hooks/api/topics'),
  useTopicAnalysis: jest.fn(),
  useAnalyzeTopic: jest.fn(),
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
  const startMock = jest.fn();
  it('renders Metricks component', async () => {
    (useTopicAnalysis as jest.Mock).mockImplementation(() => ({
      data: { result: 1 },
    }));

    renderComponent();
    await expect(screen.getByText('Restart Analysis')).toBeInTheDocument();
    expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
  });
  it('renders Start Analysis button', async () => {
    (useAnalyzeTopic as jest.Mock).mockImplementation(() => ({
      mutateAsync: startMock,
    }));
    renderComponent();
    const btn = screen.getByRole('button', { name: 'Start Analysis' });
    expect(btn).toBeInTheDocument();
    await waitFor(() => userEvent.click(btn));
    expect(startMock).toHaveBeenCalled();
  });
});
