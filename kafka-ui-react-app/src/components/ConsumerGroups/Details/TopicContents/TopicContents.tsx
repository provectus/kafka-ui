import { Table } from 'components/common/table/Table/Table.styled';
import TableHeaderCell from 'components/common/table/TableHeaderCell/TableHeaderCell';
import { ConsumerGroupTopicPartition } from 'generated-sources';
import React from 'react';

import { ContentBox, TopicContentWrapper } from './TopicContent.styled';

interface Props {
  consumers: ConsumerGroupTopicPartition[];
}

const TopicContents: React.FC<Props> = ({ consumers }) => {
  return (
    <TopicContentWrapper>
      <td colSpan={3}>
        <ContentBox>
          <Table isFullwidth>
            <thead>
              <tr>
                <TableHeaderCell title="Partition" />
                <TableHeaderCell title="Consumer ID" />
                <TableHeaderCell title="Host" />
                <TableHeaderCell title="Messages behind" />
                <TableHeaderCell title="Current offset" />
                <TableHeaderCell title="End offset" />
              </tr>
            </thead>
            <tbody>
              {consumers.map((consumer) => (
                <tr key={consumer.partition}>
                  <td>{consumer.partition}</td>
                  <td>{consumer.consumerId}</td>
                  <td>{consumer.host}</td>
                  <td>{consumer.messagesBehind}</td>
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
