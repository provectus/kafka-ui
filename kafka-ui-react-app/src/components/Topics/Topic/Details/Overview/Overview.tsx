import React from 'react';
import { Topic, TopicDetails } from 'generated-sources';
import { ClusterName, TopicName } from 'redux/interfaces';
import Dropdown from 'components/common/Dropdown/Dropdown';
import DropdownItem from 'components/common/Dropdown/DropdownItem';
import MetricsSection from 'components/common/Metrics/MetricsSection';
import Indicator from 'components/common/Metrics/Indicator';
import ClusterContext from 'components/contexts/ClusterContext';
import BytesFormatted from 'components/common/BytesFormatted/BytesFormatted';
import { Table } from 'components/common/table/Table/Table.styled';
import TableHeaderCell from 'components/common/table/TableHeaderCell/TableHeaderCell';
import VerticalElipsisIcon from 'components/common/Icons/VerticalElipsisIcon';
import {
  StyledMetricsWrapper,
  MetricsLightText,
  MetricsRedText,
} from 'components/common/Metrics/Metrics.styled';
import TagStyled from 'components/common/Tag/Tag.styled';

interface Props extends Topic, TopicDetails {
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
      <StyledMetricsWrapper>
        <MetricsSection>
          <Indicator label="Partitions">{partitionCount}</Indicator>
          <Indicator label="Replication Factor">{replicationFactor}</Indicator>
          <Indicator label="URP" title="Under replicated partitions" isAlert>
            <MetricsRedText>{underReplicatedPartitions}</MetricsRedText>
          </Indicator>
          <Indicator label="In sync replicas" isAlert>
            {inSyncReplicas && replicas && inSyncReplicas < replicas ? (
              <MetricsRedText>{inSyncReplicas}</MetricsRedText>
            ) : (
              inSyncReplicas
            )}
            <MetricsLightText> of {replicas}</MetricsLightText>
          </Indicator>
          <Indicator label="Type">
            <TagStyled color="gray">
              {internal ? 'Internal' : 'External'}
            </TagStyled>
          </Indicator>
          <Indicator label="Segment Size" title="">
            <BytesFormatted value={segmentSize} />
          </Indicator>
          <Indicator label="Segment count">{segmentCount}</Indicator>
          <Indicator label="Clean Up Policy">
            <TagStyled color="gray">{cleanUpPolicy || 'Unknown'}</TagStyled>
          </Indicator>
        </MetricsSection>
      </StyledMetricsWrapper>
      <div>
        <Table isFullwidth>
          <thead>
            <tr>
              <TableHeaderCell title="Partition ID" />
              <TableHeaderCell title="Broker leader" />
              <TableHeaderCell title="Min offset" />
              <TableHeaderCell title="Max offset" />
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
                  {!internal && !isReadOnly ? (
                    <Dropdown label={<VerticalElipsisIcon />} right>
                      <DropdownItem
                        onClick={() =>
                          clearTopicMessages(clusterName, topicName, [
                            partition,
                          ])
                        }
                      >
                        <MetricsRedText>Clear Messages</MetricsRedText>
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
