import { TopicColumnsToSort } from 'generated-sources';
import React from 'react';

import ListHeaderCell from './ListHeaderCell';

export interface ListHeaderProps {
  orderBy: TopicColumnsToSort | null;
  setOrderBy: React.Dispatch<React.SetStateAction<TopicColumnsToSort | null>>;
}

const ListHeader: React.FC<ListHeaderProps> = ({ orderBy, setOrderBy }) => {
  return (
    <thead>
      <tr>
        <ListHeaderCell
          value={TopicColumnsToSort.NAME}
          title="Topic Name"
          orderBy={orderBy}
          setOrderBy={setOrderBy}
        />
        <ListHeaderCell
          value={TopicColumnsToSort.TOTAL_PARTITIONS}
          title="Total Partitions"
          orderBy={orderBy}
          setOrderBy={setOrderBy}
        />
        <ListHeaderCell
          value={TopicColumnsToSort.OUT_OF_SYNC_REPLICAS}
          title="Out of sync replicas"
          orderBy={orderBy}
          setOrderBy={setOrderBy}
        />
        <th>Type</th>
        <th> </th>
      </tr>
    </thead>
  );
};

export default ListHeader;
