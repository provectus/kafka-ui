import { render } from 'lib/testHelpers';
import React from 'react';
import Query, {
  getFormattedErrorFromTableData,
} from 'components/KsqlDb/Query/Query';
import { screen, waitFor, within } from '@testing-library/dom';
import fetchMock from 'fetch-mock';
import userEvent from '@testing-library/user-event';
import { Route } from 'react-router-dom';
import { clusterKsqlDbQueryPath } from 'lib/paths';

const clusterName = 'testLocal';
const renderComponent = () =>
  render(
    <Route path={clusterKsqlDbQueryPath(':clusterName')}>
      <Query />
    </Route>,
    {
      pathname: clusterKsqlDbQueryPath(clusterName),
    }
  );

// Small mock to get rid of reference error
class EventSourceMock {
  url: string;

  close: () => void;

  open: () => void;

  error: () => void;

  onmessage: () => void;

  constructor(url: string) {
    this.url = url;
    this.open = jest.fn();
    this.error = jest.fn();
    this.onmessage = jest.fn();
    this.close = jest.fn();
  }
}

describe('Query', () => {
  it('renders', () => {
    renderComponent();

    expect(screen.getByLabelText('KSQL')).toBeInTheDocument();
    expect(
      screen.getByLabelText('Stream properties (JSON format)')
    ).toBeInTheDocument();
  });

  afterEach(() => fetchMock.reset());
  it('fetch on execute', async () => {
    renderComponent();

    const mock = fetchMock.postOnce(`/api/clusters/${clusterName}/ksql/v2`, {
      pipeId: 'testPipeID',
    });

    Object.defineProperty(window, 'EventSource', {
      value: EventSourceMock,
    });

    await waitFor(() =>
      userEvent.paste(
        within(screen.getByLabelText('KSQL')).getByRole('textbox'),
        'show tables;'
      )
    );

    await waitFor(() =>
      userEvent.click(screen.getByRole('button', { name: 'Execute' }))
    );
    expect(mock.calls().length).toBe(1);
  });

  it('fetch on execute with streamParams', async () => {
    renderComponent();

    const mock = fetchMock.postOnce(`/api/clusters/${clusterName}/ksql/v2`, {
      pipeId: 'testPipeID',
    });

    Object.defineProperty(window, 'EventSource', {
      value: EventSourceMock,
    });

    await waitFor(() =>
      userEvent.paste(
        within(screen.getByLabelText('KSQL')).getByRole('textbox'),
        'show tables;'
      )
    );

    await waitFor(() =>
      userEvent.paste(
        within(
          screen.getByLabelText('Stream properties (JSON format)')
        ).getByRole('textbox'),
        '{"some":"json"}'
      )
    );

    await waitFor(() =>
      userEvent.click(screen.getByRole('button', { name: 'Execute' }))
    );
    expect(mock.calls().length).toBe(1);
  });

  it('fetch on execute with streamParams', async () => {
    renderComponent();

    const mock = fetchMock.postOnce(`/api/clusters/${clusterName}/ksql/v2`, {
      pipeId: 'testPipeID',
    });

    Object.defineProperty(window, 'EventSource', {
      value: EventSourceMock,
    });

    await waitFor(() =>
      userEvent.paste(
        within(screen.getByLabelText('KSQL')).getByRole('textbox'),
        'show tables;'
      )
    );

    await waitFor(() =>
      userEvent.paste(
        within(
          screen.getByLabelText('Stream properties (JSON format)')
        ).getByRole('textbox'),
        '{"some":"json"}'
      )
    );

    await waitFor(() =>
      userEvent.click(screen.getByRole('button', { name: 'Execute' }))
    );
    expect(mock.calls().length).toBe(1);
  });
});

describe('getFormattedErrorFromTableData', () => {
  it('works', () => {
    expect(getFormattedErrorFromTableData([['Test Error']])).toStrictEqual({
      title: 'Test Error',
      message: '',
    });

    expect(
      getFormattedErrorFromTableData([
        ['some_type', 'errorCode', 'messageText'],
      ])
    ).toStrictEqual({
      title: '[Error #errorCode] some_type',
      message: 'messageText',
    });

    expect(
      getFormattedErrorFromTableData([
        [
          'some_type',
          'errorCode',
          'messageText',
          'statementText',
          ['test1', 'test2'],
        ],
      ])
    ).toStrictEqual({
      title: '[Error #errorCode] some_type',
      message: '[test1, test2] "statementText" messageText',
    });

    expect(getFormattedErrorFromTableData([])).toStrictEqual({
      title: 'Unknown error',
      message: 'Recieved empty response',
    });
  });
});
