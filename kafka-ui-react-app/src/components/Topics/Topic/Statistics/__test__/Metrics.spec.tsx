import React from 'react';
import { screen, waitFor } from '@testing-library/react';
import { render, WithRoute } from 'lib/testHelpers';
import Statistics from 'components/Topics/Topic/Statistics/Statistics';
import { clusterTopicStatisticsPath } from 'lib/paths';
import {
  useTopicAnalysis,
  useCancelTopicAnalysis,
  useAnalyzeTopic,
} from 'lib/hooks/api/topics';
import { topicStatsPayload } from 'lib/fixtures/topics';
import userEvent from '@testing-library/user-event';

const clusterName = 'local';
const topicName = 'topic';

jest.mock('lib/hooks/api/topics', () => ({
  ...jest.requireActual('lib/hooks/api/topics'),
  useTopicAnalysis: jest.fn(),
  useCancelTopicAnalysis: jest.fn(),
  useAnalyzeTopic: jest.fn(),
}));

describe('Metrics', () => {
  const renderComponent = () => {
    const path = clusterTopicStatisticsPath(clusterName, topicName);
    return render(
      <WithRoute path={clusterTopicStatisticsPath()}>
        <Statistics />
      </WithRoute>,
      { initialEntries: [path] }
    );
  };

  describe('when analysis is in progress', () => {
    const cancelMock = jest.fn();

    beforeEach(() => {
      (useCancelTopicAnalysis as jest.Mock).mockImplementation(() => ({
        mutateAsync: cancelMock,
      }));
      (useTopicAnalysis as jest.Mock).mockImplementation(() => ({
        data: {
          progress: {
            ...topicStatsPayload.progress,
            completenessPercent: undefined,
          },
          result: undefined,
        },
      }));
      renderComponent();
    });

    it('renders Stop Analysis button', async () => {
      const btn = screen.getByRole('button', { name: 'Stop Analysis' });
      expect(btn).toBeInTheDocument();
      await userEvent.click(btn);
      expect(cancelMock).toHaveBeenCalled();
    });

    it('renders Progress bar', () => {
      const progressbar = screen.getByRole('progressbar');
      expect(progressbar).toBeInTheDocument();
      expect(progressbar).toHaveStyleRule('width', '0%');
    });

    it('calculate Timer ', () => {
      expect(screen.getByText('Passed since start')).toBeInTheDocument();
    });
  });

  describe('when analysis is completed', () => {
    const restartMock = jest.fn();
    beforeEach(() => {
      (useTopicAnalysis as jest.Mock).mockImplementation(() => ({
        data: { ...topicStatsPayload, progress: undefined },
      }));
      (useAnalyzeTopic as jest.Mock).mockImplementation(() => ({
        mutateAsync: restartMock,
      }));
      renderComponent();
    });
    it('renders metrics', async () => {
      const btn = screen.getByRole('button', { name: 'Restart Analysis' });
      expect(btn).toBeInTheDocument();
      expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
      expect(screen.getAllByRole('group').length).toEqual(3);
      expect(screen.getByRole('table')).toBeInTheDocument();
    });
    it('renders restarts analisis', async () => {
      const btn = screen.getByRole('button', { name: 'Restart Analysis' });
      await waitFor(() => userEvent.click(btn));
      expect(restartMock).toHaveBeenCalled();
    });
    it('renders expandable table', async () => {
      expect(screen.getByRole('table')).toBeInTheDocument();
      const rows = screen.getAllByRole('row');
      expect(rows.length).toEqual(3);
      const btns = screen.getAllByRole('button', { name: 'Expand row' });
      expect(btns.length).toEqual(2);
      expect(screen.queryByText('Partition stats')).not.toBeInTheDocument();

      await userEvent.click(btns[0]);
      expect(screen.getAllByText('Partition stats').length).toEqual(1);
      await userEvent.click(btns[1]);
      expect(screen.getAllByText('Partition stats').length).toEqual(2);
    });
  });

  it('returns empty container', () => {
    (useTopicAnalysis as jest.Mock).mockImplementation(() => ({
      data: undefined,
    }));
    renderComponent();
    expect(screen.queryByRole('table')).not.toBeInTheDocument();
    expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
  });
  it('returns empty container', () => {
    (useTopicAnalysis as jest.Mock).mockImplementation(() => ({
      data: {},
    }));
    renderComponent();
    expect(screen.queryByRole('table')).not.toBeInTheDocument();
    expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
  });
});
