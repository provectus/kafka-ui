import React from 'react';
import { render, WithRoute } from 'lib/testHelpers';
import Table, { TimestampCell } from 'components/common/NewTable';
import { screen } from '@testing-library/dom';
import { ColumnDef } from '@tanstack/react-table';
import userEvent from '@testing-library/user-event';

const data = [
  { timestamp: 1660034383725, text: 'lorem' },
  { timestamp: 1660034399999, text: 'ipsum' },
  { timestamp: 1660034399922, text: 'dolor' },
  { timestamp: 1660034199922, text: 'sit' },
];
type Datum = typeof data[0];

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
];

const ExpandedRow: React.FC = () => <div>I am expanded row</div>;

interface Props {
  path?: string;
  canExpand?: boolean;
}

const renderComponent = ({ path, canExpand }: Props = {}) => {
  render(
    <WithRoute path="/">
      <Table
        columns={columns}
        data={data}
        renderSubComponent={ExpandedRow}
        getRowCanExpand={() => !!canExpand}
      />
    </WithRoute>,
    { initialEntries: [path || ''] }
  );
};

describe('Table', () => {
  it('renders table', () => {
    renderComponent();
    expect(screen.getByRole('table')).toBeInTheDocument();
  });

  it('renders TimestampCell', () => {
    renderComponent();
    expect(screen.getByText('08.09.22 11:39:43 am')).toBeInTheDocument();
  });

  describe('ExpanderCell', () => {
    it('renders button', () => {
      renderComponent({ canExpand: true });
      const btns = screen.getAllByRole('button', { name: 'Expand row' });
      expect(btns.length).toEqual(data.length);

      expect(screen.queryByText('I am expanded row')).not.toBeInTheDocument();
      userEvent.click(btns[2]);
      expect(screen.getByText('I am expanded row')).toBeInTheDocument();
      userEvent.click(btns[0]);
      expect(screen.getAllByText('I am expanded row').length).toEqual(2);
    });

    it('does not render button', () => {
      renderComponent({ canExpand: false });
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
});
