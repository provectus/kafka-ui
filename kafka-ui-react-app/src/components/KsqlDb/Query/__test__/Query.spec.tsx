import { render, EventSourceMock, WithRoute } from 'lib/testHelpers';
import React from 'react';
import Query, {
  getFormattedErrorFromTableData,
} from 'components/KsqlDb/Query/Query';
import { screen } from '@testing-library/dom';
import fetchMock from 'fetch-mock';
import { clusterKsqlDbQueryPath } from 'lib/paths';
import userEvent from '@testing-library/user-event';

const clusterName = 'testLocal';
const renderComponent = () =>
  render(
    <WithRoute path={clusterKsqlDbQueryPath()}>
      <Query />
    </WithRoute>,
    {
      initialEntries: [clusterKsqlDbQueryPath(clusterName)],
    }
  );

describe('Query', () => {
  it('renders', () => {
    renderComponent();

    expect(screen.getByLabelText('KSQL')).toBeInTheDocument();
    expect(screen.getByLabelText('Stream properties:')).toBeInTheDocument();
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
    const inputs = screen.getAllByRole('textbox');
    const textAreaElement = inputs[0] as HTMLTextAreaElement;

    textAreaElement.focus();
    await userEvent.paste('show tables;');
    await userEvent.click(screen.getByRole('button', { name: 'Execute' }));

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

    const inputs = screen.getAllByRole('textbox');
    const textAreaElement = inputs[0] as HTMLTextAreaElement;
    textAreaElement.focus();
    await userEvent.paste('show tables;');

    const key = screen.getByLabelText('key');
    key.focus();
    await userEvent.paste('key');
    const value = screen.getByLabelText('value');
    value.focus();
    await userEvent.paste('value');

    await userEvent.click(screen.getByRole('button', { name: 'Execute' }));

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
