import React from 'react';
import { Partition, Replica } from 'generated-sources';
import ClusterContext from 'components/contexts/ClusterContext';
import { Table } from 'components/common/table/Table/Table.styled';
import TableHeaderCell from 'components/common/table/TableHeaderCell/TableHeaderCell';
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

  return (
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
  );
};

export default Overview;
