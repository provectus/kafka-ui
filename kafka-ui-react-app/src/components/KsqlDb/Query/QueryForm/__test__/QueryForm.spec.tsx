import { render } from 'lib/testHelpers';
import React from 'react';
import QueryForm, { Props } from 'components/KsqlDb/Query/QueryForm/QueryForm';
import { screen, waitFor, within } from '@testing-library/dom';
import userEvent from '@testing-library/user-event';

const renderComponent = (props: Props) => render(<QueryForm {...props} />);

describe('QueryForm', () => {
  it('renders', () => {
    renderComponent({
      fetching: false,
      hasResults: false,
      handleClearResults: jest.fn(),
      handleSSECancel: jest.fn(),
      submitHandler: jest.fn(),
    });

    const KSQLBlock = screen.getByLabelText('KSQL');
    expect(KSQLBlock).toBeInTheDocument();
    expect(within(KSQLBlock).getByText('KSQL')).toBeInTheDocument();
    expect(
      within(KSQLBlock).getByRole('button', { name: 'Clear' })
    ).toBeInTheDocument();
    // Represents SQL editor
    expect(within(KSQLBlock).getByRole('textbox')).toBeInTheDocument();

    const streamPropertiesBlock = screen.getByLabelText(
      'Stream properties (JSON format)'
    );
    expect(streamPropertiesBlock).toBeInTheDocument();
    expect(
      within(streamPropertiesBlock).getByText('Stream properties (JSON format)')
    ).toBeInTheDocument();
    expect(
      within(streamPropertiesBlock).getByRole('button', { name: 'Clear' })
    ).toBeInTheDocument();
    // Represents JSON editor
    expect(
      within(streamPropertiesBlock).getByRole('textbox')
    ).toBeInTheDocument();

    // Form controls
    expect(screen.getByRole('button', { name: 'Execute' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Execute' })).toBeEnabled();
    expect(
      screen.getByRole('button', { name: 'Stop query' })
    ).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Stop query' })).toBeDisabled();
    expect(
      screen.getByRole('button', { name: 'Clear results' })
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Clear results' })
    ).toBeDisabled();
  });

  it('renders error with empty input', async () => {
    const submitFn = jest.fn();
    renderComponent({
      fetching: false,
      hasResults: false,
      handleClearResults: jest.fn(),
      handleSSECancel: jest.fn(),
      submitHandler: submitFn,
    });

    await waitFor(() =>
      userEvent.click(screen.getByRole('button', { name: 'Execute' }))
    );
    expect(screen.getByText('ksql is a required field')).toBeInTheDocument();
    expect(submitFn).not.toBeCalled();
  });

  it('renders error with non-JSON streamProperties', async () => {
    renderComponent({
      fetching: false,
      hasResults: false,
      handleClearResults: jest.fn(),
      handleSSECancel: jest.fn(),
      submitHandler: jest.fn(),
    });

    await waitFor(() =>
      // the use of `paste` is a hack that i found somewhere,
      // `type` won't work
      userEvent.paste(
        within(
          screen.getByLabelText('Stream properties (JSON format)')
        ).getByRole('textbox'),
        'not-a-JSON-string'
      )
    );

    await waitFor(() =>
      userEvent.click(screen.getByRole('button', { name: 'Execute' }))
    );

    expect(
      screen.getByText('streamsProperties is not JSON object')
    ).toBeInTheDocument();
  });

  it('renders without error with correct JSON', async () => {
    renderComponent({
      fetching: false,
      hasResults: false,
      handleClearResults: jest.fn(),
      handleSSECancel: jest.fn(),
      submitHandler: jest.fn(),
    });

    await waitFor(() =>
      userEvent.paste(
        within(
          screen.getByLabelText('Stream properties (JSON format)')
        ).getByRole('textbox'),
        '{"totallyJSON": "string"}'
      )
    );

    await waitFor(() =>
      userEvent.click(screen.getByRole('button', { name: 'Execute' }))
    );

    expect(
      screen.queryByText('streamsProperties is not JSON object')
    ).not.toBeInTheDocument();
  });

  it('submits with correct inputs', async () => {
    const submitFn = jest.fn();
    renderComponent({
      fetching: false,
      hasResults: false,
      handleClearResults: jest.fn(),
      handleSSECancel: jest.fn(),
      submitHandler: submitFn,
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
        '{"totallyJSON": "string"}'
      )
    );

    await waitFor(() =>
      userEvent.click(screen.getByRole('button', { name: 'Execute' }))
    );

    expect(
      screen.queryByText('ksql is a required field')
    ).not.toBeInTheDocument();

    expect(
      screen.queryByText('streamsProperties is not JSON object')
    ).not.toBeInTheDocument();

    expect(submitFn).toBeCalled();
  });

  it('clear results is enabled when has results', async () => {
    const clearFn = jest.fn();
    renderComponent({
      fetching: false,
      hasResults: true,
      handleClearResults: clearFn,
      handleSSECancel: jest.fn(),
      submitHandler: jest.fn(),
    });

    expect(screen.getByRole('button', { name: 'Clear results' })).toBeEnabled();

    await waitFor(() =>
      userEvent.click(screen.getByRole('button', { name: 'Clear results' }))
    );

    expect(clearFn).toBeCalled();
  });

  it('stop query query is enabled when is fetching', async () => {
    const cancelFn = jest.fn();
    renderComponent({
      fetching: true,
      hasResults: false,
      handleClearResults: jest.fn(),
      handleSSECancel: cancelFn,
      submitHandler: jest.fn(),
    });

    expect(screen.getByRole('button', { name: 'Stop query' })).toBeEnabled();

    await waitFor(() =>
      userEvent.click(screen.getByRole('button', { name: 'Stop query' }))
    );

    expect(cancelFn).toBeCalled();
  });

  it('submits form with ctrl+enter on KSQL editor', async () => {
    const submitFn = jest.fn();
    renderComponent({
      fetching: false,
      hasResults: false,
      handleClearResults: jest.fn(),
      handleSSECancel: jest.fn(),
      submitHandler: submitFn,
    });

    await waitFor(() =>
      userEvent.paste(
        within(screen.getByLabelText('KSQL')).getByRole('textbox'),
        'show tables;'
      )
    );

    await waitFor(() =>
      userEvent.type(
        within(screen.getByLabelText('KSQL')).getByRole('textbox'),
        '{ctrl}{enter}'
      )
    );

    expect(submitFn.mock.calls.length).toBe(1);
  });

  it('submits form with ctrl+enter on streamProperties editor', async () => {
    const submitFn = jest.fn();
    renderComponent({
      fetching: false,
      hasResults: false,
      handleClearResults: jest.fn(),
      handleSSECancel: jest.fn(),
      submitHandler: submitFn,
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
      userEvent.type(
        within(
          screen.getByLabelText('Stream properties (JSON format)')
        ).getByRole('textbox'),
        '{ctrl}{enter}'
      )
    );

    expect(submitFn.mock.calls.length).toBe(1);
  });

  it('clears KSQL with Clear button', async () => {
    renderComponent({
      fetching: false,
      hasResults: false,
      handleClearResults: jest.fn(),
      handleSSECancel: jest.fn(),
      submitHandler: jest.fn(),
    });

    await waitFor(() =>
      userEvent.paste(
        within(screen.getByLabelText('KSQL')).getByRole('textbox'),
        'show tables;'
      )
    );

    await waitFor(() =>
      userEvent.click(
        within(screen.getByLabelText('KSQL')).getByRole('button', {
          name: 'Clear',
        })
      )
    );

    expect(screen.queryByText('show tables;')).not.toBeInTheDocument();
  });

  it('clears streamProperties with Clear button', async () => {
    renderComponent({
      fetching: false,
      hasResults: false,
      handleClearResults: jest.fn(),
      handleSSECancel: jest.fn(),
      submitHandler: jest.fn(),
    });

    await waitFor(() =>
      userEvent.paste(
        within(
          screen.getByLabelText('Stream properties (JSON format)')
        ).getByRole('textbox'),
        '{"some":"json"}'
      )
    );

    await waitFor(() =>
      userEvent.click(
        within(
          screen.getByLabelText('Stream properties (JSON format)')
        ).getByRole('button', {
          name: 'Clear',
        })
      )
    );

    expect(screen.queryByText('{"some":"json"}')).not.toBeInTheDocument();
  });
});
