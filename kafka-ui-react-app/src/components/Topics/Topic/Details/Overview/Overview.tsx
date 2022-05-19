import React from 'react';
import { Partition, Replica, Topic, TopicDetails } from 'generated-sources';
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
import { ReplicaCell } from 'components/Topics/Topic/Details/Details.styled';

export interface Props extends Topic, TopicDetails {
  clusterName: ClusterName;
  topicName: TopicName;
  clearTopicMessages(params: {
    clusterName: ClusterName;
    topicName: TopicName;
    partitions?: number[];
  }): void;
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

  const messageCount = React.useMemo(() => {
    return (partitions || []).reduce((memo, partition) => {
      return memo + partition.offsetMax - partition.offsetMin;
    }, 0);
  }, [partitions]);

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
            alertType={underReplicatedPartitions === 0 ? 'success' : 'error'}
          >
            {underReplicatedPartitions === 0 ? (
              <Metrics.LightText>{underReplicatedPartitions}</Metrics.LightText>
            ) : (
              <Metrics.RedText>{underReplicatedPartitions}</Metrics.RedText>
            )}
          </Metrics.Indicator>
          <Metrics.Indicator
            label="In Sync Replicas"
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
          <Metrics.Indicator label="Message Count">
            {messageCount}
          </Metrics.Indicator>
        </Metrics.Section>
      </Metrics.Wrapper>
      <div>
        <Table isFullwidth>
          <thead>
            <tr>
              <TableHeaderCell title="Partition ID" />
              <TableHeaderCell title="Replicas" />
              <TableHeaderCell title="First Offset" />
              <TableHeaderCell title="Next Offset" />
              <TableHeaderCell title="Message Count" />
              <TableHeaderCell title=" " />
            </tr>
          </thead>
          <tbody>
            {partitions?.map((partition: Partition) => (
              <tr key={`partition-list-item-key-${partition.partition}`}>
                <td>{partition.partition}</td>
                <td>
                  {partition.replicas?.map((replica: Replica) => (
                    <ReplicaCell
                      leader={replica.leader}
                      key={`replica-list-item-key-${replica.broker}`}
                    >
                      {replica.broker}
                    </ReplicaCell>
                  ))}
                </td>
                <td>{partition.offsetMin}</td>
                <td>{partition.offsetMax}</td>
                <td>{partition.offsetMax - partition.offsetMin}</td>
                <td style={{ width: '5%' }}>
                  {!internal && !isReadOnly && cleanUpPolicy === 'DELETE' ? (
                    <Dropdown label={<VerticalElipsisIcon />} right>
                      <DropdownItem
                        onClick={() =>
                          clearTopicMessages({
                            clusterName,
                            topicName,
                            partitions: [partition.partition],
                          })
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
