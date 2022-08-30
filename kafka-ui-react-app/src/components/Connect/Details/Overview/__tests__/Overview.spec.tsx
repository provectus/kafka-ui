import React from 'react';
import Overview from 'components/Connect/Details/Overview/Overview';
import { connector, tasks } from 'lib/fixtures/kafkaConnect';
import { screen } from '@testing-library/react';
import { render } from 'lib/testHelpers';
import { useConnector, useConnectorTasks } from 'lib/hooks/api/kafkaConnect';

jest.mock('lib/hooks/api/kafkaConnect', () => ({
  useConnector: jest.fn(),
  useConnectorTasks: jest.fn(),
}));

describe('Overview', () => {
  it('is empty when no connector', () => {
    (useConnector as jest.Mock).mockImplementation(() => ({
      data: undefined,
    }));
    (useConnectorTasks as jest.Mock).mockImplementation(() => ({
      data: undefined,
    }));

    render(<Overview />);
    expect(screen.queryByText('Worker')).not.toBeInTheDocument();
  });

  describe('when connector is loaded', () => {
    beforeEach(() => {
      (useConnector as jest.Mock).mockImplementation(() => ({
        data: connector,
      }));
    });
    beforeEach(() => {
      (useConnectorTasks as jest.Mock).mockImplementation(() => ({
        data: tasks,
      }));
    });

    it('renders metrics', () => {
      render(<Overview />);

      expect(screen.getByText('Worker')).toBeInTheDocument();
      expect(
        screen.getByText(connector.status.workerId as string)
      ).toBeInTheDocument();

      expect(screen.getByText('Type')).toBeInTheDocument();
      expect(
        screen.getByText(connector.config['connector.class'] as string)
      ).toBeInTheDocument();

      expect(screen.getByText('Tasks Running')).toBeInTheDocument();
      expect(screen.getByText(2)).toBeInTheDocument();
      expect(screen.getByText('Tasks Failed')).toBeInTheDocument();
      expect(screen.getByText(1)).toBeInTheDocument();
    });
  });
});
