import React from 'react';
import { render, WithRoute } from 'lib/testHelpers';
import Table, {
  TableProps,
  TimestampCell,
  SizeCell,
} from 'components/common/NewTable';
import { screen, waitFor } from '@testing-library/dom';
import { ColumnDef, Row } from '@tanstack/react-table';
import userEvent from '@testing-library/user-event';
import { formatTimestamp } from 'lib/dateTimeHelpers';
import { act } from '@testing-library/react';

type Datum = typeof data[0];

const data = [
  { timestamp: 1660034383725, text: 'lorem', selectable: false, size: 1234 },
  { timestamp: 1660034399999, text: 'ipsum', selectable: true, size: 3 },
  { timestamp: 1660034399922, text: 'dolor', selectable: true, size: 50000 },
  { timestamp: 1660034199922, text: 'sit', selectable: false, size: 1_312_323 },
];

const columns: ColumnDef<Datum>[] = [
  {
    header: 'DateTime',
    accessorKey: 'timestamp',
    cell: TimestampCell,
  },
  {
    header: 'Text',
    accessorKey: 'text',
  },
  {
    header: 'Size',
    accessorKey: 'size',
    cell: SizeCell,
  },
];

const ExpandedRow: React.FC = () => <div>I am expanded row</div>;

interface Props extends TableProps<Datum> {
  path?: string;
}

const renderComponent = (props: Partial<Props> = {}) => {
  render(
    <WithRoute path="/">
      <Table
        columns={columns}
        data={data}
        renderSubComponent={ExpandedRow}
        {...props}
      />
    </WithRoute>,
    { initialEntries: [props.path || ''] }
  );
};

describe('Table', () => {
  it('renders table', () => {
    renderComponent();
    expect(screen.getByRole('table')).toBeInTheDocument();
    expect(screen.getAllByRole('row').length).toEqual(data.length + 1);
  });

  it('renders empty table', () => {
    renderComponent({ data: [] });
    expect(screen.getByRole('table')).toBeInTheDocument();
    expect(screen.getAllByRole('row').length).toEqual(2);
    expect(screen.getByText('No rows found')).toBeInTheDocument();
  });

  it('renders empty table with custom message', () => {
    const emptyMessage = 'Super custom message';
    renderComponent({ data: [], emptyMessage });
    expect(screen.getByRole('table')).toBeInTheDocument();
    expect(screen.getAllByRole('row').length).toEqual(2);
    expect(screen.getByText(emptyMessage)).toBeInTheDocument();
  });

  it('renders SizeCell', () => {
    renderComponent();
    expect(screen.getByText('1KB')).toBeInTheDocument();
    expect(screen.getByText('3Bytes')).toBeInTheDocument();
    expect(screen.getByText('49KB')).toBeInTheDocument();
    expect(screen.getByText('1MB')).toBeInTheDocument();
  });

  it('renders TimestampCell', () => {
    renderComponent();
    expect(
      screen.getByText(formatTimestamp(data[0].timestamp))
    ).toBeInTheDocument();
  });

  describe('ExpanderCell', () => {
    it('renders button', () => {
      renderComponent({ getRowCanExpand: () => true });
      const btns = screen.getAllByRole('button', { name: 'Expand row' });
      expect(btns.length).toEqual(data.length);

      expect(screen.queryByText('I am expanded row')).not.toBeInTheDocument();
      userEvent.click(btns[2]);
      expect(screen.getByText('I am expanded row')).toBeInTheDocument();
      userEvent.click(btns[0]);
      expect(screen.getAllByText('I am expanded row').length).toEqual(2);
    });

    it('does not render button', () => {
      renderComponent({ getRowCanExpand: () => false });
      expect(
        screen.queryByRole('button', { name: 'Expand row' })
      ).not.toBeInTheDocument();
      expect(screen.queryByText('I am expanded row')).not.toBeInTheDocument();
    });
  });

  describe('Pagination', () => {
    it('does not render page buttons', () => {
      renderComponent();
      expect(
        screen.queryByRole('button', { name: 'Next' })
      ).not.toBeInTheDocument();
    });

    it('renders page buttons', async () => {
      renderComponent({ path: '?perPage=1' });
      // Check it renders header row and only one data row
      expect(screen.getAllByRole('row').length).toEqual(2);
      expect(screen.getByText('lorem')).toBeInTheDocument();

      // Check it renders page buttons
      const firstBtn = screen.getByRole('button', { name: '⇤' });
      const prevBtn = screen.getByRole('button', { name: '← Previous' });
      const nextBtn = screen.getByRole('button', { name: 'Next →' });
      const lastBtn = screen.getByRole('button', { name: '⇥' });

      expect(firstBtn).toBeInTheDocument();
      expect(firstBtn).toBeDisabled();
      expect(prevBtn).toBeInTheDocument();
      expect(prevBtn).toBeDisabled();
      expect(nextBtn).toBeInTheDocument();
      expect(nextBtn).toBeEnabled();
      expect(lastBtn).toBeInTheDocument();
      expect(lastBtn).toBeEnabled();

      userEvent.click(nextBtn);
      expect(screen.getByText('ipsum')).toBeInTheDocument();
      expect(prevBtn).toBeEnabled();
      expect(firstBtn).toBeEnabled();

      userEvent.click(lastBtn);
      expect(screen.getByText('sit')).toBeInTheDocument();
      expect(lastBtn).toBeDisabled();
      expect(nextBtn).toBeDisabled();

      userEvent.click(prevBtn);
      expect(screen.getByText('dolor')).toBeInTheDocument();

      userEvent.click(firstBtn);
      expect(screen.getByText('lorem')).toBeInTheDocument();
    });

    it('renders go to page input', async () => {
      renderComponent({ path: '?perPage=1' });
      // Check it renders header row and only one data row
      expect(screen.getAllByRole('row').length).toEqual(2);
      expect(screen.getByText('lorem')).toBeInTheDocument();
      const input = screen.getByRole('spinbutton', { name: 'Go to page:' });
      expect(input).toBeInTheDocument();

      userEvent.clear(input);
      userEvent.type(input, '2');
      expect(screen.getByText('ipsum')).toBeInTheDocument();
    });
  });

  describe('Sorting', () => {
    it('sort rows', async () => {
      await act(() =>
        renderComponent({
          path: '/?sortBy=text&&sortDirection=desc',
          enableSorting: true,
        })
      );
      expect(screen.getAllByRole('row').length).toEqual(data.length + 1);
      const th = screen.getByRole('columnheader', { name: 'Text' });
      expect(th).toBeInTheDocument();

      let rows = [];
      // Check initial sort order by text column is descending
      rows = screen.getAllByRole('row');
      expect(rows[4].textContent?.indexOf('dolor')).toBeGreaterThan(-1);
      expect(rows[3].textContent?.indexOf('ipsum')).toBeGreaterThan(-1);
      expect(rows[2].textContent?.indexOf('lorem')).toBeGreaterThan(-1);
      expect(rows[1].textContent?.indexOf('sit')).toBeGreaterThan(-1);

      // Disable sorting by text column
      await waitFor(() => userEvent.click(th));
      rows = screen.getAllByRole('row');
      expect(rows[1].textContent?.indexOf('lorem')).toBeGreaterThan(-1);
      expect(rows[2].textContent?.indexOf('ipsum')).toBeGreaterThan(-1);
      expect(rows[3].textContent?.indexOf('dolor')).toBeGreaterThan(-1);
      expect(rows[4].textContent?.indexOf('sit')).toBeGreaterThan(-1);

      // Sort by text column ascending
      await waitFor(() => userEvent.click(th));
      rows = screen.getAllByRole('row');
      expect(rows[1].textContent?.indexOf('dolor')).toBeGreaterThan(-1);
      expect(rows[2].textContent?.indexOf('ipsum')).toBeGreaterThan(-1);
      expect(rows[3].textContent?.indexOf('lorem')).toBeGreaterThan(-1);
      expect(rows[4].textContent?.indexOf('sit')).toBeGreaterThan(-1);
    });
  });

  describe('Row Selecting', () => {
    beforeEach(() => {
      renderComponent({
        enableRowSelection: (row: Row<Datum>) => row.original.selectable,
        batchActionsBar: () => <div>I am Action Bar</div>,
      });
    });
    it('renders selectable rows', () => {
      expect(screen.getAllByRole('row').length).toEqual(data.length + 1);
      const checkboxes = screen.getAllByRole('checkbox');
      expect(checkboxes.length).toEqual(data.length + 1);
      expect(checkboxes[1]).toBeDisabled();
      expect(checkboxes[2]).toBeEnabled();
      expect(checkboxes[3]).toBeEnabled();
      expect(checkboxes[4]).toBeDisabled();
    });

    it('renders action bar', () => {
      expect(screen.getAllByRole('row').length).toEqual(data.length + 1);
      expect(screen.queryByText('I am Action Bar')).not.toBeInTheDocument();
      const checkboxes = screen.getAllByRole('checkbox');
      expect(checkboxes.length).toEqual(data.length + 1);
      userEvent.click(checkboxes[2]);
      expect(screen.getByText('I am Action Bar')).toBeInTheDocument();
    });
  });
});
