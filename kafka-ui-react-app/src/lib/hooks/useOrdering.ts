import { SortOrder } from 'generated-sources';
import { StandardEnumValue } from 'lib/types';
import { useState } from 'react';

const useOrdering = <Type extends StandardEnumValue>(
  initOrderBy: Type,
  initSort: SortOrder = SortOrder.ASC,
  autoToggleSort = true
) => {
  const [currentOrderBy, setOrderBy] = useState<Type>(initOrderBy);
  const [currentSortOrder, setSortOrder] = useState<SortOrder>(initSort);

  const toggleOrderSort = () =>
    setSortOrder((s) => (s === SortOrder.ASC ? SortOrder.DESC : SortOrder.ASC));

  // orderBy: StandardEnumValue - is a hack to get around a problem that i encountered
  // i can't find a proper way to make a variable that can be any king of enum
  // in TableHeaderCellProps props
  const handleOrderBy = (orderBy: StandardEnumValue) =>
    setOrderBy((prevOrderBy) => {
      // If prevOrderBy was the same - we just toggle sort
      if (autoToggleSort && prevOrderBy === orderBy) {
        toggleOrderSort();
      }
      return orderBy as Type;
    });

  return {
    orderBy: currentOrderBy,
    handleOrderBy,
    sortOrder: currentSortOrder,
    toggleOrderSort,
  };
};

export default useOrdering;
