import React from 'react';
import { screen, waitFor } from '@testing-library/react';
import { render, WithRoute } from 'lib/testHelpers';
import Statistics from 'components/Topics/Topic/Statistics/Statistics';
import { clusterTopicStatisticsPath } from 'lib/paths';
import { useTopicAnalysis, useAnalyzeTopic } from 'lib/hooks/api/topics';
import userEvent from '@testing-library/user-event';
import { usePermission } from 'lib/hooks/usePermission';

const clusterName = 'local';
const topicName = 'topic';

jest.mock('lib/hooks/api/topics', () => ({
  ...jest.requireActual('lib/hooks/api/topics'),
  useTopicAnalysis: jest.fn(),
  useAnalyzeTopic: jest.fn(),
}));

jest.mock('lib/hooks/usePermission', () => ({
  usePermission: jest.fn(),
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
  it('renders Metrics component', async () => {
    (useTopicAnalysis as jest.Mock).mockImplementation(() => ({
      data: { result: 1 },
    }));

    renderComponent();
    await expect(screen.getByText('Restart Analysis')).toBeInTheDocument();
    expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
  });
  it('renders Start Analysis button', async () => {
    jest.spyOn(console, 'error').mockImplementation(() => undefined);
    (useAnalyzeTopic as jest.Mock).mockImplementation(() => ({
      mutateAsync: startMock,
    }));
    (usePermission as jest.Mock).mockImplementation(() => true);
    renderComponent();
    const btn = screen.getByRole('button', { name: 'Start Analysis' });
    expect(btn).toBeInTheDocument();
    await waitFor(() => userEvent.click(btn));
    expect(startMock).toHaveBeenCalled();
    jest.clearAllMocks();
  });

  describe('Permissions', () => {
    afterEach(() => {
      jest.clearAllMocks();
    });
    it('checks the Restart Analysis button is disable when there is not permission', () => {
      // throwing intentional For error boundaries to work
      jest.spyOn(console, 'error').mockImplementation(() => undefined);
      (useAnalyzeTopic as jest.Mock).mockImplementation(() => ({
        mutateAsync: startMock,
      }));
      (useTopicAnalysis as jest.Mock).mockImplementation(() => {
        throw new Error('Error boundary');
      });
      (usePermission as jest.Mock).mockImplementation(() => false);
      renderComponent();
      expect(
        screen.getByRole('button', { name: 'Start Analysis' })
      ).toBeDisabled();
    });

    it('checks the Stop Analysis button is not disable when there is permission', () => {
      // throwing intentional For error boundaries to work
      jest.spyOn(console, 'error').mockImplementation(() => undefined);
      (useAnalyzeTopic as jest.Mock).mockImplementation(() => ({
        mutateAsync: startMock,
      }));
      (useTopicAnalysis as jest.Mock).mockImplementation(() => {
        throw new Error('Error boundary');
      });
      (usePermission as jest.Mock).mockImplementation(() => true);
      renderComponent();
      expect(
        screen.getByRole('button', { name: 'Start Analysis' })
      ).toBeEnabled();
    });
  });
});
