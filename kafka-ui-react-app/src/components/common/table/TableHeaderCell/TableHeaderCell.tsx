import React from 'react';
import { TopicColumnsToSort } from 'generated-sources';
import * as S from 'components/common/table/TableHeaderCell/TableHeaderCell.styled';
// import cx from 'classnames';

export interface TableHeaderCellProps {
  title?: string;
  previewText?: string;
  onPreview?: () => void;
  orderBy?: TopicColumnsToSort | null;
  orderValue?: TopicColumnsToSort | null;
  handleOrderBy?: (orderBy: TopicColumnsToSort | null) => void;
}

const TableHeaderCell: React.FC<TableHeaderCellProps> = (props) => {
  const {
    title,
    previewText,
    onPreview,
    orderBy,
    orderValue,
    handleOrderBy,
    ...restProps
  } = props;

  const isSortable = !!(orderValue && handleOrderBy);
  const isCurrentSort = isSortable && orderBy === orderValue;

  return (
    <S.TableHeaderCell {...restProps}>
      <S.Title
        isSortable={isSortable}
        isCurrentSort={isCurrentSort}
        {...(orderValue &&
          handleOrderBy && {
            onClick: () => handleOrderBy(orderValue),
            onKeyDown: (e) => e.code === 'Space' && handleOrderBy(orderValue),
            role: 'button',
            tabIndex: 0,
          })}
      >
        {title}
        {isSortable && (
          <span className="icon is-small">
            <i className="fas fa-sort" />
          </span>
        )}
      </S.Title>

      {previewText && (
        <S.Preview
          onClick={onPreview}
          onKeyDown={onPreview}
          role="button"
          tabIndex={0}
        >
          {previewText}
        </S.Preview>
      )}
    </S.TableHeaderCell>
  );
};

export default TableHeaderCell;
