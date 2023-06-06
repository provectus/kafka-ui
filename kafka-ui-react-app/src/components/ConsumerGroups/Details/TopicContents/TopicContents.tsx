import { Table } from 'components/common/table/Table/Table.styled';
import TableHeaderCell from 'components/common/table/TableHeaderCell/TableHeaderCell';
import { ConsumerGroupTopicPartition, SortOrder } from 'generated-sources';
import React from 'react';

import { ContentBox, TopicContentWrapper } from './TopicContent.styled';

interface Props {
  consumers: ConsumerGroupTopicPartition[];
}

type OrderByKey = keyof ConsumerGroupTopicPartition;
interface Headers {
  title: string;
  orderBy: OrderByKey | undefined;
}

const TABLE_HEADERS_MAP: Headers[] = [
  { title: 'Partition', orderBy: 'partition' },
  { title: 'Consumer ID', orderBy: 'consumerId' },
  { title: 'Host', orderBy: 'host' },
  { title: 'Consumer Lag', orderBy: 'consumerLag' },
  { title: 'Current Offset', orderBy: 'currentOffset' },
  { title: 'End offset', orderBy: 'endOffset' },
];

const ipV4ToNum = (ip?: string) => {
  if (typeof ip === 'string' && ip.length !== 0) {
    const withoutSlash = ip.indexOf('/') !== -1 ? ip.slice(1) : ip;
    return Number(
      withoutSlash
        .split('.')
        .map((octet) => `000${octet}`.slice(-3))
        .join('')
    );
  }
  return 0;
};

type ComparatorFunction<T> = (
  valueA: T,
  valueB: T,
  order: SortOrder,
  property?: keyof T
) => number;

const numberComparator: ComparatorFunction<ConsumerGroupTopicPartition> = (
  valueA,
  valueB,
  order,
  property
) => {
  if (property !== undefined) {
    return order === SortOrder.ASC
      ? Number(valueA[property]) - Number(valueB[property])
      : Number(valueB[property]) - Number(valueA[property]);
  }
  return 0;
};

const ipComparator: ComparatorFunction<ConsumerGroupTopicPartition> = (
  valueA,
  valueB,
  order
) =>
  order === SortOrder.ASC
    ? ipV4ToNum(valueA.host) - ipV4ToNum(valueB.host)
    : ipV4ToNum(valueB.host) - ipV4ToNum(valueA.host);

const consumerIdComparator: ComparatorFunction<ConsumerGroupTopicPartition> = (
  valueA,
  valueB,
  order
) => {
  if (valueA.consumerId && valueB.consumerId) {
    if (order === SortOrder.ASC) {
      if (valueA.consumerId?.toLowerCase() > valueB.consumerId?.toLowerCase()) {
        return 1;
      }
    }

    if (order === SortOrder.DESC) {
      if (valueB.consumerId?.toLowerCase() > valueA.consumerId?.toLowerCase()) {
        return -1;
      }
    }
  }

  return 0;
};

const TopicContents: React.FC<Props> = ({ consumers }) => {
  const [orderBy, setOrderBy] = React.useState<OrderByKey>('partition');
  const [sortOrder, setSortOrder] = React.useState<SortOrder>(SortOrder.DESC);

  const handleOrder = React.useCallback((columnName: string | null) => {
    if (typeof columnName === 'string') {
      setOrderBy(columnName as OrderByKey);
      setSortOrder((prevOrder) =>
        prevOrder === SortOrder.DESC ? SortOrder.ASC : SortOrder.DESC
      );
    }
  }, []);

  const sortedConsumers = React.useMemo(() => {
    if (orderBy && sortOrder) {
      const isNumberProperty =
        orderBy === 'partition' ||
        orderBy === 'currentOffset' ||
        orderBy === 'endOffset' ||
        orderBy === 'consumerLag';

      let comparator: ComparatorFunction<ConsumerGroupTopicPartition>;
      if (isNumberProperty) {
        comparator = numberComparator;
      }

      if (orderBy === 'host') {
        comparator = ipComparator;
      }

      if (orderBy === 'consumerId') {
        comparator = consumerIdComparator;
      }

      return consumers.sort((a, b) => comparator(a, b, sortOrder, orderBy));
    }
    return consumers;
  }, [orderBy, sortOrder, consumers]);

  return (
    <TopicContentWrapper>
      <td colSpan={3}>
        <ContentBox>
          <Table isFullwidth>
            <thead>
              <tr>
                {TABLE_HEADERS_MAP.map((header) => (
                  <TableHeaderCell
                    key={header.orderBy}
                    title={header.title}
                    orderBy={orderBy}
                    sortOrder={sortOrder}
                    orderValue={header.orderBy}
                    handleOrderBy={handleOrder}
                  />
                ))}
              </tr>
            </thead>
            <tbody>
              {sortedConsumers.map((consumer) => (
                <tr key={consumer.partition}>
                  <td>{consumer.partition}</td>
                  <td>{consumer.consumerId}</td>
                  <td>{consumer.host}</td>
                  <td>{consumer.consumerLag}</td>
                  <td>{consumer.currentOffset}</td>
                  <td>{consumer.endOffset}</td>
                </tr>
              ))}
            </tbody>
          </Table>
        </ContentBox>
      </td>
    </TopicContentWrapper>
  );
};

export default TopicContents;
