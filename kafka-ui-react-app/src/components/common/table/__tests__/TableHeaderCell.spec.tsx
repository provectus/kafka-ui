import React from 'react';
import { StaticRouter } from 'react-router';
import TableHeaderCell, {
  TableHeaderCellProps,
} from 'components/common/table/TableHeaderCell/TableHeaderCell';
import { mountWithTheme } from 'lib/testHelpers';
import { TopicColumnsToSort } from 'generated-sources';

const STUB_TITLE = 'stub test title';
const STUB_PREVIEW_TEXT = 'stub preview text';

describe('TableHeaderCell', () => {
  const setupComponent = (props: TableHeaderCellProps) => (
    <StaticRouter>
      <table>
        <thead>
          <tr>
            <TableHeaderCell {...props} />
          </tr>
        </thead>
      </table>
    </StaticRouter>
  );

  it('renders without props', () => {
    const wrapper = mountWithTheme(setupComponent({}));
    expect(wrapper.contains(<TableHeaderCell />)).toBeTruthy();
  });

  it('renders with title & preview text', () => {
    const wrapper = mountWithTheme(
      setupComponent({
        title: STUB_TITLE,
        previewText: STUB_PREVIEW_TEXT,
      })
    );

    expect(wrapper.find('span.title').text()).toEqual(STUB_TITLE);
    expect(wrapper.find('span.preview').text()).toEqual(STUB_PREVIEW_TEXT);
  });

  it('renders with orderBy props', () => {
    const wrapper = mountWithTheme(
      setupComponent({
        title: STUB_TITLE,
        orderBy: TopicColumnsToSort.NAME,
        orderValue: TopicColumnsToSort.NAME,
      })
    );

    expect(wrapper.find('span.title').text()).toEqual(STUB_TITLE);
    expect(wrapper.exists('span.icon.is-small.is-clickable')).toBeTruthy();
    expect(wrapper.exists('i.fas.fa-sort')).toBeTruthy();
  });

  it('renders with default (primary) theme', () => {
    const wrapper = mountWithTheme(
      setupComponent({
        title: STUB_TITLE,
      })
    );

    const domNode = wrapper.find('span').at(0).getDOMNode();
    const background = getComputedStyle(domNode).getPropertyValue('background');
    expect(background).toBe('rgb(255, 255, 255)');
  });
});
