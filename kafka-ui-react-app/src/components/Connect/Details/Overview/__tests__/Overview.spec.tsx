import React from 'react';
import Overview from 'components/Connect/Details/Overview/Overview';
import { connector, tasks } from 'redux/reducers/connect/__test__/fixtures';
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

    const { container } = render(<Overview />);
    expect(container).toBeEmptyDOMElement();
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
