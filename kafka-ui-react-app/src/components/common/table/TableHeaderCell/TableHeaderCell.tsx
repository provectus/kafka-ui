import React from 'react';
import { TopicColumnsToSort } from 'generated-sources';
import * as S from 'components/common/table/TableHeaderCell/TableHeaderCell.styled';
import cx from 'classnames';

export interface TableHeaderCellProps {
  title?: string;
  previewText?: string;
  onPreview?: () => void;
  orderBy?: TopicColumnsToSort | null;
  orderValue?: TopicColumnsToSort | null;
  handleOrderBy?: (orderBy: TopicColumnsToSort | null) => void;
}

const TableHeaderCell: React.FC<TableHeaderCellProps> = (props) => {
  const { title, previewText, onPreview, orderBy, orderValue, handleOrderBy } =
    props;

  return (
    <S.TableHeaderCell
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
          onClick={() =>
            orderValue && handleOrderBy && handleOrderBy(orderValue)
          }
          onKeyDown={() => handleOrderBy}
          role="button"
          tabIndex={0}
        >
          <i className="fas fa-sort" />
        </span>
      )}
    </S.TableHeaderCell>
  );
};

export default TableHeaderCell;
