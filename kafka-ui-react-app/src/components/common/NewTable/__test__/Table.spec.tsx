import React from 'react';
import { render, WithRoute } from 'lib/testHelpers';
import Table, {
  TableProps,
  TimestampCell,
  SizeCell,
  LinkCell,
  TagCell,
} from 'components/common/NewTable';
import { screen, waitFor } from '@testing-library/dom';
import { ColumnDef, Row } from '@tanstack/react-table';
import userEvent from '@testing-library/user-event';
import { formatTimestamp } from 'lib/dateTimeHelpers';
import { ConnectorState, ConsumerGroupState } from 'generated-sources';

const mockedUsedNavigate = jest.fn();

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockedUsedNavigate,
}));

type Datum = typeof data[0];

const data = [
  {
    timestamp: 1660034383725,
    text: 'lorem',
    selectable: false,
    size: 1234,
    tag: ConnectorState.RUNNING,
  },
  {
    timestamp: 1660034399999,
    text: 'ipsum',
    selectable: true,
    size: 3,
    tag: ConnectorState.FAILED,
  },
  {
    timestamp: 1660034399922,
    text: 'dolor',
    selectable: true,
    size: 50000,
    tag: ConsumerGroupState.EMPTY,
  },
  {
    timestamp: 1660034199922,
    text: 'sit',
    selectable: false,
    size: 1_312_323,
    tag: 'some_string',
  },
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
    cell: ({ getValue }) => (
      <LinkCell
        value={`${getValue<string | number>()}`}
        to={encodeURIComponent(`${getValue<string | number>()}`)}
      />
    ),
  },
  {
    header: 'Size',
    accessorKey: 'size',
    cell: SizeCell,
  },
  {
    header: 'Tag',
    accessorKey: 'tag',
    cell: TagCell,
  },
];

const ExpandedRow: React.FC = () => <div>I am expanded row</div>;

interface Props extends TableProps<Datum> {
  path?: string;
}

const renderComponent = (props: Partial<Props> = {}) => {
  render(
    <WithRoute path="/*">
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
    expect(screen.getByText('1 KB')).toBeInTheDocument();
    expect(screen.getByText('3 Bytes')).toBeInTheDocument();
    expect(screen.getByText('49 KB')).toBeInTheDocument();
    expect(screen.getByText('1 MB')).toBeInTheDocument();
  });

  it('renders TimestampCell', () => {
    renderComponent();
    expect(
      screen.getByText(formatTimestamp(data[0].timestamp))
    ).toBeInTheDocument();
  });

  describe('LinkCell', () => {
    it('renders link', () => {
      renderComponent();
      expect(screen.getByRole('link', { name: 'lorem' })).toBeInTheDocument();
    });

    it('link click stops propagation', () => {
      const onRowClick = jest.fn();
      renderComponent({ onRowClick });
      const link = screen.getByRole('link', { name: 'lorem' });
      userEvent.click(link);
      expect(onRowClick).not.toHaveBeenCalled();
    });
  });

  describe('ExpanderCell', () => {
    it('renders button', async () => {
      renderComponent({ getRowCanExpand: () => true });
      const btns = screen.getAllByRole('button', { name: 'Expand row' });
      expect(btns.length).toEqual(data.length);

      expect(screen.queryByText('I am expanded row')).not.toBeInTheDocument();
      await userEvent.click(btns[2]);
      expect(screen.getByText('I am expanded row')).toBeInTheDocument();
      await userEvent.click(btns[0]);
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

  it('renders TagCell', () => {
    renderComponent();
    expect(screen.getByText(data[0].tag)).toBeInTheDocument();
    expect(screen.getByText(data[1].tag)).toBeInTheDocument();
    expect(screen.getByText(data[2].tag)).toBeInTheDocument();
    expect(screen.getByText(data[3].tag)).toBeInTheDocument();
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

      await userEvent.click(nextBtn);
      expect(screen.getByText('ipsum')).toBeInTheDocument();
      expect(prevBtn).toBeEnabled();
      expect(firstBtn).toBeEnabled();

      await userEvent.click(lastBtn);
      expect(screen.getByText('sit')).toBeInTheDocument();
      expect(lastBtn).toBeDisabled();
      expect(nextBtn).toBeDisabled();

      await userEvent.click(prevBtn);
      expect(screen.getByText('dolor')).toBeInTheDocument();

      await userEvent.click(firstBtn);
      expect(screen.getByText('lorem')).toBeInTheDocument();
    });

    describe('Go To page', () => {
      const getGoToPageInput = () =>
        screen.getByRole('spinbutton', { name: 'Go to page:' });

      beforeEach(() => {
        renderComponent({ path: '?perPage=1' });
      });

      it('renders Go To page', () => {
        const goToPage = getGoToPageInput();
        expect(goToPage).toBeInTheDocument();
        expect(goToPage).toHaveValue(1);
      });
      it('updates page on Go To page change', async () => {
        const goToPage = getGoToPageInput();
        await userEvent.clear(goToPage);
        await userEvent.type(goToPage, '2');
        expect(goToPage).toHaveValue(2);
        expect(screen.getByText('ipsum')).toBeInTheDocument();
      });
      it('does not update page on Go To page change if page is out of range', async () => {
        const goToPage = getGoToPageInput();
        await userEvent.type(goToPage, '5');
        expect(goToPage).toHaveValue(15);
        expect(screen.getByText('No rows found')).toBeInTheDocument();
      });
      it('does not update page on Go To page change if page is not a number', async () => {
        const goToPage = getGoToPageInput();
        await userEvent.type(goToPage, 'abc');
        expect(goToPage).toHaveValue(1);
      });
    });
  });

  describe('Sorting', () => {
    it('sort rows', async () => {
      await renderComponent({
        path: '/?sortBy=text&&sortDirection=desc',
        enableSorting: true,
      });
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

    it('renders action bar', async () => {
      expect(screen.getAllByRole('row').length).toEqual(data.length + 1);
      expect(screen.queryByText('I am Action Bar')).toBeInTheDocument();
      const checkboxes = screen.getAllByRole('checkbox');
      expect(checkboxes.length).toEqual(data.length + 1);
      await userEvent.click(checkboxes[2]);
      expect(screen.getByText('I am Action Bar')).toBeInTheDocument();
    });
  });
  describe('Clickable Row', () => {
    const onRowClick = jest.fn();
    it('handles onRowClick', async () => {
      renderComponent({ onRowClick });
      const rows = screen.getAllByRole('row');
      expect(rows.length).toEqual(data.length + 1);
      await userEvent.click(rows[1]);
      expect(onRowClick).toHaveBeenCalledTimes(1);
    });
    it('does nothing unless onRowClick is provided', async () => {
      renderComponent();
      const rows = screen.getAllByRole('row');
      expect(rows.length).toEqual(data.length + 1);
      await userEvent.click(rows[1]);
    });
    it('does not handle onRowClick if enableRowSelection', async () => {
      renderComponent({ onRowClick, enableRowSelection: true });
      const rows = screen.getAllByRole('row');
      expect(rows.length).toEqual(data.length + 1);
      await userEvent.click(rows[1]);
      expect(onRowClick).not.toHaveBeenCalled();
    });
    it('does not handle onRowClick if expandable rows', async () => {
      renderComponent({ onRowClick, getRowCanExpand: () => true });
      const rows = screen.getAllByRole('row');
      expect(rows.length).toEqual(data.length + 1);
      await userEvent.click(rows[1]);
      expect(onRowClick).not.toHaveBeenCalled();
    });
  });
});
