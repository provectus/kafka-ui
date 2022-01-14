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

    expect(wrapper.find('span').at(0).text()).toEqual(STUB_TITLE);
    expect(wrapper.find('span').at(1).text()).toEqual(STUB_PREVIEW_TEXT);
  });

  it('renders with orderBy props', () => {
    const wrapper = mountWithTheme(
      setupComponent({
        title: STUB_TITLE,
        orderBy: TopicColumnsToSort.NAME,
        orderValue: TopicColumnsToSort.NAME,
        handleOrderBy: () => {},
      })
    );

    expect(wrapper.find('span').at(0).text()).toEqual(STUB_TITLE);
    expect(wrapper.exists('span.icon.is-small')).toBeTruthy();
    expect(wrapper.exists('i.fas.fa-sort')).toBeTruthy();

    const domNode = wrapper.find('span').at(0).getDOMNode();
    const color = getComputedStyle(domNode).getPropertyValue('color');
    expect(color).toBe('rgb(79, 79, 255)');

    const cursor = getComputedStyle(domNode).getPropertyValue('cursor');
    expect(cursor).toBe('pointer');
  });

  it('renders without sort indication', () => {
    const wrapper = mountWithTheme(
      setupComponent({
        title: STUB_TITLE,
        orderValue: TopicColumnsToSort.NAME,
      })
    );

    expect(wrapper.find('span').at(0).text()).toEqual(STUB_TITLE);
    expect(wrapper.exists('span.icon.is-small')).toBeFalsy();
    expect(wrapper.exists('i.fas.fa-sort')).toBeFalsy();

    const domNode = wrapper.find('span').at(0).getDOMNode();
    const cursor = getComputedStyle(domNode).getPropertyValue('cursor');
    expect(cursor).toBe('');
  });

  it('renders with hightlighted title when orderBy and orderValue are equal', () => {
    const wrapper = mountWithTheme(
      setupComponent({
        title: STUB_TITLE,
        orderBy: TopicColumnsToSort.NAME,
        orderValue: TopicColumnsToSort.NAME,
      })
    );

    const domNode = wrapper.find('span').at(0).getDOMNode();
    const color = getComputedStyle(domNode).getPropertyValue('color');
    expect(color).toBe('rgb(79, 79, 255)');
  });

  it('renders without hightlighted title when orderBy and orderValue are not equal', () => {
    const wrapper = mountWithTheme(
      setupComponent({
        title: STUB_TITLE,
        orderBy: TopicColumnsToSort.NAME,
        orderValue: TopicColumnsToSort.OUT_OF_SYNC_REPLICAS,
      })
    );

    const domNode = wrapper.find('span').at(0).getDOMNode();
    const color = getComputedStyle(domNode).getPropertyValue('color');
    expect(color).toBe('rgb(115, 132, 140)');
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
