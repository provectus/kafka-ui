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

    const streamPropertiesBlock = screen.getByRole('textbox', { name: 'key' });
    expect(streamPropertiesBlock).toBeInTheDocument();
    expect(screen.getByText('Stream properties:')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Clear' })).toBeInTheDocument();
    expect(screen.queryAllByRole('textbox')[0]).toBeInTheDocument();

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

    await userEvent.click(screen.getByRole('button', { name: 'Execute' }));

    await waitFor(() => {
      expect(screen.getByText('ksql is a required field')).toBeInTheDocument();
      expect(submitFn).not.toBeCalled();
    });
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

    const textbox = screen.getAllByRole('textbox');
    textbox[0].focus();
    await userEvent.paste('show tables;');
    const key = screen.getByRole('textbox', { name: 'key' });
    key.focus();
    await userEvent.paste('test');
    const value = screen.getByRole('textbox', { name: 'value' });
    value.focus();
    await userEvent.paste('test');
    await userEvent.click(screen.getByRole('button', { name: 'Execute' }));

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

    await userEvent.click(
      screen.getByRole('button', { name: 'Clear results' })
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

    await userEvent.click(screen.getByRole('button', { name: 'Stop query' }));

    expect(cancelFn).toBeCalled();
  });

  it('add new property', async () => {
    renderComponent({
      fetching: false,
      hasResults: false,
      handleClearResults: jest.fn(),
      handleSSECancel: jest.fn(),
      submitHandler: jest.fn(),
    });

    const textbox = screen.getByLabelText('key');
    await userEvent.type(textbox, 'prop_name');
    await userEvent.click(
      screen.getByRole('button', { name: 'Add Stream Property' })
    );
    expect(screen.getAllByRole('textbox', { name: 'key' }).length).toEqual(2);
  });

  it("doesn't add new property", async () => {
    renderComponent({
      fetching: false,
      hasResults: false,
      handleClearResults: jest.fn(),
      handleSSECancel: jest.fn(),
      submitHandler: jest.fn(),
    });

    await userEvent.click(
      screen.getByRole('button', { name: 'Add Stream Property' })
    );
    expect(screen.getAllByRole('textbox', { name: 'key' }).length).toEqual(1);
  });

  it('delete stream property', async () => {
    await renderComponent({
      fetching: false,
      hasResults: false,
      handleClearResults: jest.fn(),
      handleSSECancel: jest.fn(),
      submitHandler: jest.fn(),
    });
    const textBoxes = screen.getAllByRole('textbox', { name: 'key' });
    textBoxes[0].focus();
    await userEvent.paste('test');
    await userEvent.click(
      screen.getByRole('button', { name: 'Add Stream Property' })
    );
    await userEvent.click(screen.getAllByLabelText('deleteProperty')[0]);

    await screen.getByRole('button', { name: 'Add Stream Property' });

    await userEvent.click(screen.getAllByLabelText('deleteProperty')[0]);

    expect(textBoxes.length).toEqual(1);
  });
});
