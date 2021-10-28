import React from 'react';
import { Topic, TopicDetails } from 'generated-sources';
import { ClusterName, TopicName } from 'redux/interfaces';
import Dropdown from 'components/common/Dropdown/Dropdown';
import DropdownItem from 'components/common/Dropdown/DropdownItem';
import MetricsWrapper from 'components/common/Dashboard/MetricsWrapper';
import Indicator from 'components/common/Dashboard/Indicator';
import ClusterContext from 'components/contexts/ClusterContext';
import BytesFormatted from 'components/common/BytesFormatted/BytesFormatted';
import StyledTable from 'components/common/table/Table/Table.styled';
import TableHeaderCell from 'components/common/table/TableHeaderCell/TableHeaderCell';
import VerticalElipsisIcon from 'components/common/Icons/VerticalElipsisIcon';
import { Colors } from 'theme/theme';
import { MetricsContainerStyled } from 'components/common/Dashboard/MetricsContainer.styled';
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
      <MetricsContainerStyled>
        <MetricsWrapper>
          <Indicator label="Partitions">{partitionCount}</Indicator>
          <Indicator label="Replication Factor">{replicationFactor}</Indicator>
          <Indicator label="URP" title="Under replicated partitions" isAlert>
            <div
              style={{
                color: Colors.red[50],
              }}
            >
              {underReplicatedPartitions}
            </div>
          </Indicator>
          <Indicator label="In sync replicas" isAlert>
            <div
              style={{
                color: Colors.red[50],
                display: 'inline',
              }}
            >
              {inSyncReplicas}
            </div>
            <span
              style={{
                color: Colors.neutral[30],
              }}
            >
              {' '}
              of {replicas}
            </span>
          </Indicator>
          <Indicator label="Type">
            <TagStyled text={internal ? 'Internal' : 'External'} color="gray" />
          </Indicator>
          <Indicator label="Segment Size" title="">
            <BytesFormatted value={segmentSize} />
          </Indicator>
          <Indicator label="Segment count">{segmentCount}</Indicator>
          <Indicator label="Clean Up Policy">
            <TagStyled text={cleanUpPolicy || 'Unknown'} color="gray" />
          </Indicator>
        </MetricsWrapper>
      </MetricsContainerStyled>
      <div>
        <StyledTable isFullwidth>
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
                        <span className="has-text-danger">Clear Messages</span>
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
        </StyledTable>
      </div>
    </>
  );
};

export default Overview;
