import React from 'react';
import { Topic, TopicDetails } from 'generated-sources';
import { ClusterName, TopicName } from 'redux/interfaces';
import Dropdown from 'components/common/Dropdown/Dropdown';
import DropdownItem from 'components/common/Dropdown/DropdownItem';
import ClusterContext from 'components/contexts/ClusterContext';
import BytesFormatted from 'components/common/BytesFormatted/BytesFormatted';
import { Table } from 'components/common/table/Table/Table.styled';
import TableHeaderCell from 'components/common/table/TableHeaderCell/TableHeaderCell';
import VerticalElipsisIcon from 'components/common/Icons/VerticalElipsisIcon';
import * as Metrics from 'components/common/Metrics';
import { Tag } from 'components/common/Tag/Tag.styled';

export interface Props extends Topic, TopicDetails {
  clusterName: ClusterName;
  topicName: TopicName;
  clearTopicMessages(
    clusterName: ClusterName,
    topicName: TopicName,
    partitions?: number[]
  ): void;
}

const Overview: React.FC<Props> = ({
  partitions,
  underReplicatedPartitions,
  inSyncReplicas,
  replicas,
  partitionCount,
  internal,
  replicationFactor,
  segmentSize,
  segmentCount,
  clusterName,
  topicName,
  cleanUpPolicy,
  clearTopicMessages,
}) => {
  const { isReadOnly } = React.useContext(ClusterContext);

  return (
    <>
      <Metrics.Wrapper>
        <Metrics.Section>
          <Metrics.Indicator label="Partitions">
            {partitionCount}
          </Metrics.Indicator>
          <Metrics.Indicator label="Replication Factor">
            {replicationFactor}
          </Metrics.Indicator>
          <Metrics.Indicator
            label="URP"
            title="Under replicated partitions"
            isAlert
            alertType={underReplicatedPartitions === 0 ? 'error' : 'success'}
          >
            <Metrics.RedText>{underReplicatedPartitions}</Metrics.RedText>
          </Metrics.Indicator>
          <Metrics.Indicator
            label="ISR"
            title="In Sync Replicas"
            isAlert
            alertType={inSyncReplicas === replicas ? 'success' : 'error'}
          >
            {inSyncReplicas && replicas && inSyncReplicas < replicas ? (
              <Metrics.RedText>{inSyncReplicas}</Metrics.RedText>
            ) : (
              inSyncReplicas
            )}
            <Metrics.LightText> of {replicas}</Metrics.LightText>
          </Metrics.Indicator>
          <Metrics.Indicator label="Type">
            <Tag color="gray">{internal ? 'Internal' : 'External'}</Tag>
          </Metrics.Indicator>
          <Metrics.Indicator label="Segment Size" title="">
            <BytesFormatted value={segmentSize} />
          </Metrics.Indicator>
          <Metrics.Indicator label="Segment Count">
            {segmentCount}
          </Metrics.Indicator>
          <Metrics.Indicator label="Clean Up Policy">
            <Tag color="gray">{cleanUpPolicy || 'Unknown'}</Tag>
          </Metrics.Indicator>
        </Metrics.Section>
      </Metrics.Wrapper>
      <div>
        <Table isFullwidth>
          <thead>
            <tr>
              <TableHeaderCell title="Partition ID" />
              <TableHeaderCell title="Broker Leader" />
              <TableHeaderCell title="Min Offset" />
              <TableHeaderCell title="Max Offset" />
              <TableHeaderCell title=" " />
            </tr>
          </thead>
          <tbody>
            {partitions?.map(({ partition, leader, offsetMin, offsetMax }) => (
              <tr key={`partition-list-item-key-${partition}`}>
                <td>{partition}</td>
                <td>{leader}</td>
                <td>{offsetMin}</td>
                <td>{offsetMax}</td>
                <td style={{ width: '5%' }}>
                  {!internal && !isReadOnly && cleanUpPolicy === 'DELETE' ? (
                    <Dropdown label={<VerticalElipsisIcon />} right>
                      <DropdownItem
                        onClick={() =>
                          clearTopicMessages(clusterName, topicName, [
                            partition,
                          ])
                        }
                        danger
                      >
                        Clear Messages
                      </DropdownItem>
                    </Dropdown>
                  ) : null}
                </td>
              </tr>
            ))}
            {partitions?.length === 0 && (
              <tr>
                <td colSpan={10}>No Partitions found</td>
              </tr>
            )}
          </tbody>
        </Table>
      </div>
    </>
  );
};

export default Overview;
