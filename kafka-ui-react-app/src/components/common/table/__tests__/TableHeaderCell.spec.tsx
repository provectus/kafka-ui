import React from 'react';
import { screen, within } from '@testing-library/react';
import { render } from 'lib/testHelpers';
import TableHeaderCell, {
  TableHeaderCellProps,
} from 'components/common/table/TableHeaderCell/TableHeaderCell';
import { TopicColumnsToSort } from 'generated-sources';
import theme from 'theme/theme';
import userEvent from '@testing-library/user-event';

const SPACE_KEY = ' ';

const testTitle = 'test title';
const testPreviewText = 'test preview text';
const handleOrderBy = jest.fn();
const onPreview = jest.fn();

const sortIconTitle = 'Sort icon';

describe('TableHeaderCell', () => {
  const setupComponent = (props: Partial<TableHeaderCellProps> = {}) =>
    render(
      <table>
        <thead>
          <tr>
            <TableHeaderCell {...props} />;
          </tr>
        </thead>
      </table>
    );

  it('renders without props', () => {
    setupComponent();
    expect(screen.getByRole('columnheader')).toBeInTheDocument();
  });

  it('renders with title & preview text', () => {
    setupComponent({
      title: testTitle,
      previewText: testPreviewText,
    });

    const columnheader = screen.getByRole('columnheader');
    expect(within(columnheader).getByText(testTitle)).toBeInTheDocument();
    expect(within(columnheader).getByText(testPreviewText)).toBeInTheDocument();
  });

  it('renders with orderable props', () => {
    setupComponent({
      title: testTitle,
      orderBy: TopicColumnsToSort.NAME,
      orderValue: TopicColumnsToSort.NAME,
      handleOrderBy,
    });
    const columnheader = screen.getByRole('columnheader');
    const title = within(columnheader).getByRole('button');
    expect(title).toBeInTheDocument();
    expect(title).toHaveTextContent(testTitle);
    expect(title).toHaveStyle(`color: ${theme.table.th.color.active};`);
    expect(title).toHaveStyle('cursor: pointer;');
  });

  it('renders click on title triggers handler', () => {
    setupComponent({
      title: testTitle,
      orderBy: TopicColumnsToSort.NAME,
      orderValue: TopicColumnsToSort.NAME,
      handleOrderBy,
    });
    const columnheader = screen.getByRole('columnheader');
    const title = within(columnheader).getByRole('button');
    userEvent.click(title);
    expect(handleOrderBy.mock.calls.length).toBe(1);
  });

  it('renders space on title triggers handler', () => {
    setupComponent({
      title: testTitle,
      orderBy: TopicColumnsToSort.NAME,
      orderValue: TopicColumnsToSort.NAME,
      handleOrderBy,
    });
    const columnheader = screen.getByRole('columnheader');
    const title = within(columnheader).getByRole('button');
    userEvent.type(title, SPACE_KEY);
    // userEvent.type clicks and only then presses space
    expect(handleOrderBy.mock.calls.length).toBe(2);
  });

  it('click on preview triggers handler', () => {
    setupComponent({
      title: testTitle,
      previewText: testPreviewText,
      onPreview,
    });
    const columnheader = screen.getByRole('columnheader');
    const preview = within(columnheader).getByRole('button');
    userEvent.click(preview);
    expect(onPreview.mock.calls.length).toBe(1);
  });

  it('click on preview triggers handler', () => {
    setupComponent({
      title: testTitle,
      previewText: testPreviewText,
      onPreview,
    });
    const columnheader = screen.getByRole('columnheader');
    const preview = within(columnheader).getByRole('button');
    userEvent.type(preview, SPACE_KEY);
    // userEvent.type clicks and only then presses space
    expect(onPreview.mock.calls.length).toBe(2);
  });

  it('renders without sort indication', () => {
    setupComponent({
      title: testTitle,
      orderBy: TopicColumnsToSort.NAME,
    });

    const columnheader = screen.getByRole('columnheader');
    const title = within(columnheader).getByText(testTitle);
    expect(within(title).queryByTitle(sortIconTitle)).not.toBeInTheDocument();
    expect(title).toHaveStyle('cursor: default;');
  });

  it('renders with hightlighted title when orderBy and orderValue are equal', () => {
    setupComponent({
      title: testTitle,
      orderBy: TopicColumnsToSort.NAME,
      orderValue: TopicColumnsToSort.NAME,
      handleOrderBy: jest.fn(),
    });
    const columnheader = screen.getByRole('columnheader');
    const title = within(columnheader).getByText(testTitle);
    expect(title).toHaveStyle(`color: ${theme.table.th.color.active};`);
  });

  it('renders without hightlighted title when orderBy and orderValue are not equal', () => {
    setupComponent({
      title: testTitle,
      orderBy: TopicColumnsToSort.NAME,
      orderValue: TopicColumnsToSort.OUT_OF_SYNC_REPLICAS,
      handleOrderBy: jest.fn(),
    });
    const columnheader = screen.getByRole('columnheader');
    const title = within(columnheader).getByText(testTitle);
    expect(title).toHaveStyle(`color: ${theme.table.th.color.normal}`);
  });

  it('renders with default (primary) theme', () => {
    setupComponent({
      title: testTitle,
    });

    const columnheader = screen.getByRole('columnheader');
    const title = within(columnheader).getByText(testTitle);
    expect(title).toHaveStyle(
      `background: ${theme.table.th.backgroundColor.normal};`
    );
  });
});
