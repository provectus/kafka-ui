import React from 'react';
import Overview from 'components/Connect/Details/Overview/Overview';
import { connector } from 'redux/reducers/connect/__test__/fixtures';
import { screen } from '@testing-library/react';
import { render } from 'lib/testHelpers';

describe('Overview', () => {
  it('is empty when no connector', () => {
    const { container } = render(
      <Overview connector={null} runningTasksCount={10} failedTasksCount={2} />
    );
    expect(container).toBeEmptyDOMElement();
  });

  it('renders metrics', () => {
    const running = 234789237;
    const failed = 373737;
    render(
      <Overview
        connector={connector}
        runningTasksCount={running}
        failedTasksCount={failed}
      />
    );
    expect(screen.getByText('Worker')).toBeInTheDocument();
    expect(
      screen.getByText(connector.status.workerId as string)
    ).toBeInTheDocument();

    expect(screen.getByText('Type')).toBeInTheDocument();
    expect(
      screen.getByText(connector.config['connector.class'] as string)
    ).toBeInTheDocument();

    expect(screen.getByText('Tasks Running')).toBeInTheDocument();
    expect(screen.getByText(running)).toBeInTheDocument();
    expect(screen.getByText('Tasks Failed')).toBeInTheDocument();
    expect(screen.getByText(failed)).toBeInTheDocument();
  });
});
