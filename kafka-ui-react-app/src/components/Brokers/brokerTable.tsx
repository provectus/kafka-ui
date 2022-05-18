import React, { FC } from 'react';
import TableHeaderCell from 'components/common/table/TableHeaderCell/TableHeaderCell';
import { Table } from 'components/common/table/Table/Table.styled';
import { Broker, BrokerDiskUsage } from 'generated-sources';
import { BrokersTableRow } from 'components/Brokers/brokerTableRow';

interface IProps {
  diskUsage?: BrokerDiskUsage[];
  items: Broker[];
}

export const BrokersTable: FC<IProps> = ({ diskUsage, items }) => {
  console.log({ diskUsage });
  return (
    <Table isFullwidth>
      <thead>
        <tr>
          <TableHeaderCell />
          <TableHeaderCell title="Broker" />
          <TableHeaderCell title="Segment Size (Mb)" />
          <TableHeaderCell title="Segment Count" />
          <TableHeaderCell title="Port" />
          <TableHeaderCell title="Host" />
        </tr>
      </thead>
      <tbody>
        {(!diskUsage || diskUsage.length === 0) && (
          <tr>
            <td colSpan={10}>Disk usage data not available</td>
          </tr>
        )}

        {diskUsage &&
          diskUsage.length !== 0 &&
          diskUsage.map(({ brokerId, segmentSize, segmentCount }) => {
            const brokerItem = items?.find((item) => item.id === brokerId);
            console.log({ brokerItem });
            return (
              <BrokersTableRow
                key={brokerId}
                {...{ brokerId, segmentSize, segmentCount, brokerItem }}
              />
            );
          })}
      </tbody>
    </Table>
  );
};
