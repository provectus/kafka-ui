import React from 'react';
import { Partition, Replica } from 'generated-sources';
import ClusterContext from 'components/contexts/ClusterContext';
import BytesFormatted from 'components/common/BytesFormatted/BytesFormatted';
import { Table } from 'components/common/table/Table/Table.styled';
import TableHeaderCell from 'components/common/table/TableHeaderCell/TableHeaderCell';
import * as Metrics from 'components/common/Metrics';
import { Tag } from 'components/common/Tag/Tag.styled';
import { useAppDispatch } from 'lib/hooks/redux';
import { RouteParamsClusterTopic } from 'lib/paths';
import useAppParams from 'lib/hooks/useAppParams';
import { Dropdown, DropdownItem } from 'components/common/Dropdown';
import { clearTopicMessages } from 'redux/reducers/topicMessages/topicMessagesSlice';
import { useTopicDetails } from 'lib/hooks/api/topics';

import * as S from './Overview.styled';

const Overview: React.FC = () => {
  const { clusterName, topicName } = useAppParams<RouteParamsClusterTopic>();
  const dispatch = useAppDispatch();
  const { data } = useTopicDetails({ clusterName, topicName });
  const { isReadOnly } = React.useContext(ClusterContext);

  const messageCount = React.useMemo(
    () =>
      (data?.partitions || []).reduce((memo, partition) => {
        return memo + partition.offsetMax - partition.offsetMin;
      }, 0),
    [data]
  );

  return (
    <>
      <Metrics.Wrapper>
        <Metrics.Section>
          <Metrics.Indicator label="Partitions">
            {data?.partitionCount}
          </Metrics.Indicator>
          <Metrics.Indicator label="Replication Factor">
            {data?.replicationFactor}
          </Metrics.Indicator>
          <Metrics.Indicator
            label="URP"
            title="Under replicated partitions"
            isAlert
            alertType={
              data?.underReplicatedPartitions === 0 ? 'success' : 'error'
            }
          >
            {data?.underReplicatedPartitions === 0 ? (
              <Metrics.LightText>
                {data?.underReplicatedPartitions}
              </Metrics.LightText>
            ) : (
              <Metrics.RedText>
                {data?.underReplicatedPartitions}
              </Metrics.RedText>
            )}
          </Metrics.Indicator>
          <Metrics.Indicator
            label="In Sync Replicas"
            isAlert
            alertType={
              data?.inSyncReplicas === data?.replicas ? 'success' : 'error'
            }
          >
            {data?.inSyncReplicas &&
            data?.replicas &&
            data?.inSyncReplicas < data?.replicas ? (
              <Metrics.RedText>{data?.inSyncReplicas}</Metrics.RedText>
            ) : (
              data?.inSyncReplicas
            )}
            <Metrics.LightText> of {data?.replicas}</Metrics.LightText>
          </Metrics.Indicator>
          <Metrics.Indicator label="Type">
            <Tag color="gray">{data?.internal ? 'Internal' : 'External'}</Tag>
          </Metrics.Indicator>
          <Metrics.Indicator label="Segment Size" title="">
            <BytesFormatted value={data?.segmentSize} />
          </Metrics.Indicator>
          <Metrics.Indicator label="Segment Count">
            {data?.segmentCount}
          </Metrics.Indicator>
          <Metrics.Indicator label="Clean Up Policy">
            <Tag color="gray">{data?.cleanUpPolicy || 'Unknown'}</Tag>
          </Metrics.Indicator>
          <Metrics.Indicator label="Message Count">
            {messageCount}
          </Metrics.Indicator>
          <Metrics.Indicator label="Production">
            <BytesFormatted value={data?.bytesInPerSec}/>
          </Metrics.Indicator>
          <Metrics.Indicator label="Consumption">
            <BytesFormatted value={data?.bytesOutPerSec}/>
          </Metrics.Indicator>
        </Metrics.Section>
      </Metrics.Wrapper>
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
          {data?.partitions?.map((partition: Partition) => (
            <tr key={`partition-list-item-key-${partition.partition}`}>
              <td>{partition.partition}</td>
              <td>
                {partition.replicas?.map(({ broker, leader }: Replica) => (
                  <S.Replica
                    leader={leader}
                    key={broker}
                    title={leader ? 'Leader' : ''}
                  >
                    {broker}
                  </S.Replica>
                ))}
              </td>
              <td>{partition.offsetMin}</td>
              <td>{partition.offsetMax}</td>
              <td>{partition.offsetMax - partition.offsetMin}</td>
              <td style={{ width: '5%' }}>
                {!data?.internal &&
                !isReadOnly &&
                data?.cleanUpPolicy === 'DELETE' ? (
                  <Dropdown>
                    <DropdownItem
                      onClick={() =>
                        dispatch(
                          clearTopicMessages({
                            clusterName,
                            topicName,
                            partitions: [partition.partition],
                          })
                        ).unwrap()
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
          {data?.partitions?.length === 0 && (
            <tr>
              <td colSpan={10}>No Partitions found</td>
            </tr>
          )}
        </tbody>
      </Table>
    </>
  );
};

export default Overview;
