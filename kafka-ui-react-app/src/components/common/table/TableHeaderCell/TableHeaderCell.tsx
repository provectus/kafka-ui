import React from 'react';
import { TopicColumnsToSort } from 'generated-sources';
import * as S from 'components/common/table/TableHeaderCell/TableHeaderCell.styled';

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

  const isOrdered = !!orderValue && orderValue === orderBy;
  const isOrderable = !!(orderValue && handleOrderBy);

  const handleOnClick = () => {
    return orderValue && handleOrderBy && handleOrderBy(orderValue);
  };
  const handleOnKeyDown = (event: React.KeyboardEvent) => {
    return (
      event.code === 'Space' &&
      orderValue &&
      handleOrderBy &&
      handleOrderBy(orderValue)
    );
  };
  const orderableProps = isOrderable && {
    isOrderable,
    onClick: handleOnClick,
    onKeyDown: handleOnKeyDown,
    role: 'button',
    tabIndex: 0,
  };
  return (
    <S.TableHeaderCell {...restProps}>
      <S.Title isOrdered={isOrdered} {...orderableProps}>
        {title}
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
