import { render, EventSourceMock } from 'lib/testHelpers';
import React from 'react';
import Query, {
  getFormattedErrorFromTableData,
} from 'components/KsqlDb/Query/Query';
import { screen, within } from '@testing-library/dom';
import fetchMock from 'fetch-mock';
import userEvent from '@testing-library/user-event';
import { Route } from 'react-router-dom';
import { clusterKsqlDbQueryPath } from 'lib/paths';
import { act } from '@testing-library/react';

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

    await act(() => {
      userEvent.paste(
        within(screen.getByLabelText('KSQL')).getByRole('textbox'),
        'show tables;'
      );
      userEvent.click(screen.getByRole('button', { name: 'Execute' }));
    });

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

    await act(() => {
      userEvent.paste(
        within(screen.getByLabelText('KSQL')).getByRole('textbox'),
        'show tables;'
      );
      userEvent.paste(
        within(
          screen.getByLabelText('Stream properties (JSON format)')
        ).getByRole('textbox'),
        '{"some":"json"}'
      );
      userEvent.click(screen.getByRole('button', { name: 'Execute' }));
    });
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

    await act(() => {
      userEvent.paste(
        within(screen.getByLabelText('KSQL')).getByRole('textbox'),
        'show tables;'
      );
      userEvent.paste(
        within(
          screen.getByLabelText('Stream properties (JSON format)')
        ).getByRole('textbox'),
        '{"some":"json"}'
      );
      userEvent.click(screen.getByRole('button', { name: 'Execute' }));
    });
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
