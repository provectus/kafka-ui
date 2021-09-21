import React from 'react';
import { TopicColumnsToSort } from 'generated-sources';
import StyledTableHeaderCell from 'components/common/table/TableHeaderCell/TableHeaderCell.styled';
import cx from 'classnames';

export interface TableHeaderCellProps {
  title?: string;
  thType?: 'primary';
  previewText?: string;
  onPreview?: () => void;
  orderBy?: TopicColumnsToSort | null;
  orderValue?: TopicColumnsToSort | null;
  onOrderBy?: (orderBy: TopicColumnsToSort | null) => void;
}

const TableHeaderCell: React.FC<TableHeaderCellProps> = (props) => {
  const { title, previewText, onPreview, orderBy, orderValue, onOrderBy } =
    props;

  return (
    <StyledTableHeaderCell
      className={cx(orderBy && orderBy === orderValue && 'has-text-link-dark')}
      {...props}
    >
      <span className="title">{title}</span>
      {previewText && (
        <span
          className="preview"
          onClick={onPreview}
          onKeyDown={onPreview}
          role="button"
          tabIndex={0}
        >
          {previewText}
        </span>
      )}
      {orderValue && (
        <span
          className="icon is-small is-clickable"
          onClick={() => orderValue && onOrderBy && onOrderBy(orderValue)}
          onKeyDown={() => onOrderBy}
          role="button"
          tabIndex={0}
        >
          <i className="fas fa-sort" />
        </span>
      )}
    </StyledTableHeaderCell>
  );
};

export default TableHeaderCell;
