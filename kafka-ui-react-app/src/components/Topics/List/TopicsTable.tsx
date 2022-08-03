import React from 'react';
import { SortOrder, Topic, TopicColumnsToSort } from 'generated-sources';
import { useSearchParams } from 'react-router-dom';
import { useDeleteTopic, useTopics } from 'lib/hooks/api/topics';
import useAppParams from 'lib/hooks/useAppParams';
import { ClusterName } from 'redux/interfaces';
import { PER_PAGE } from 'lib/constants';
import { useTableState } from 'lib/hooks/useTableState';
import { ControlPanelWrapper } from 'components/common/ControlPanel/ControlPanel.styled';
import { Button } from 'components/common/Button/Button';
import { clusterTopicCopyRelativePath } from 'lib/paths';
import { useConfirm } from 'lib/hooks/useConfirm';
import { SmartTable } from 'components/common/SmartTable/SmartTable';
import { TableColumn } from 'components/common/SmartTable/TableColumn';
import ClusterContext from 'components/contexts/ClusterContext';
import { useAppDispatch } from 'lib/hooks/redux';
import { clearTopicMessages } from 'redux/reducers/topicMessages/topicMessagesSlice';

import {
  MessagesCell,
  OutOfSyncReplicasCell,
  TitleCell,
  TopicSizeCell,
} from './TopicsTableCells';
import ActionsCell from './ActionsCell';
import { ActionsTd } from './List.styled';

const TopicsTable: React.FC = () => {
  const { clusterName } = useAppParams<{ clusterName: ClusterName }>();
  const [searchParams, setSearchParams] = useSearchParams();
  const { isReadOnly } = React.useContext(ClusterContext);
  const dispatch = useAppDispatch();
  const confirm = useConfirm();
  const deleteTopic = useDeleteTopic(clusterName);
  const { data, refetch } = useTopics({
    clusterName,
    page: Number(searchParams.get('page') || 1),
    perPage: Number(searchParams.get('perPage') || PER_PAGE),
    search: searchParams.get('q') || undefined,
    showInternal: !searchParams.has('hideInternal'),
    orderBy: (searchParams.get('orderBy') as TopicColumnsToSort) || undefined,
    sortOrder: (searchParams.get('sortOrder') as SortOrder) || undefined,
  });

  const handleOrderBy = (orderBy: string | null) => {
    const currentOrderBy = searchParams.get('orderBy');
    const currentSortOrder = searchParams.get('sortOrder');

    if (orderBy) {
      if (orderBy === currentOrderBy) {
        searchParams.set(
          'sortOrder',
          currentSortOrder === SortOrder.DESC ? SortOrder.ASC : SortOrder.DESC
        );
      }

      searchParams.set('orderBy', orderBy);
    } else {
      searchParams.delete('orderBy');
      searchParams.delete('sortOrder');
    }
    setSearchParams(searchParams, { replace: true });
  };

  const tableState = useTableState<Topic, string>(
    data?.topics || [],
    {
      idSelector: (topic) => topic.name,
      totalPages: data?.pageCount || 0,
      isRowSelectable: (topic) => !topic.internal,
    },
    {
      handleOrderBy,
      orderBy: searchParams.get('orderBy'),
      sortOrder: (searchParams.get('sortOrder') as SortOrder) || SortOrder.ASC,
    }
  );

  const getSelectedTopic = (): string => {
    const name = Array.from(tableState.selectedIds)[0];
    const selectedTopic =
      tableState.data.find((topic: Topic) => topic.name === name) || {};

    return Object.keys(selectedTopic)
      .map((x: string) => {
        const value = selectedTopic[x as keyof typeof selectedTopic];
        return value && x !== 'partitions' ? `${x}=${value}` : null;
      })
      .join('&');
  };

  const clearSelectedTopics = () => tableState.toggleSelection(false);

  const deleteTopicsHandler = () => {
    const selectedTopics = Array.from(tableState.selectedIds);
    confirm('Are you sure you want to remove selected topics?', async () => {
      try {
        await Promise.all(
          selectedTopics.map((topicName) => deleteTopic.mutateAsync(topicName))
        );
        clearSelectedTopics();
      } catch (e) {
        // do nothing;
      } finally {
        refetch();
      }
    });
  };

  const purgeTopicsHandler = () => {
    const selectedTopics = Array.from(tableState.selectedIds);
    confirm(
      'Are you sure you want to purge messages of selected topics?',
      async () => {
        try {
          await Promise.all(
            selectedTopics.map((topicName) =>
              dispatch(clearTopicMessages({ clusterName, topicName })).unwrap()
            )
          );
          clearSelectedTopics();
        } catch (e) {
          // do nothing;
        } finally {
          refetch();
        }
      }
    );
  };

  return (
    <>
      {tableState.selectedCount > 0 && (
        <ControlPanelWrapper>
          <Button
            buttonSize="M"
            buttonType="secondary"
            onClick={deleteTopicsHandler}
          >
            Delete selected topics
          </Button>
          {tableState.selectedCount === 1 && (
            <Button
              buttonSize="M"
              buttonType="secondary"
              to={{
                pathname: clusterTopicCopyRelativePath,
                search: `?${getSelectedTopic()}`,
              }}
            >
              Copy selected topic
            </Button>
          )}

          <Button
            buttonSize="M"
            buttonType="secondary"
            onClick={purgeTopicsHandler}
          >
            Purge messages of selected topics
          </Button>
        </ControlPanelWrapper>
      )}
      <SmartTable
        selectable={!isReadOnly}
        tableState={tableState}
        placeholder="No topics found"
        isFullwidth
        paginated
        hoverable
      >
        <TableColumn
          maxWidth="350px"
          title="Topic Name"
          cell={TitleCell}
          orderValue={TopicColumnsToSort.NAME}
        />
        <TableColumn
          title="Total Partitions"
          field="partitions.length"
          orderValue={TopicColumnsToSort.TOTAL_PARTITIONS}
        />
        <TableColumn
          title="Out of sync replicas"
          cell={OutOfSyncReplicasCell}
          orderValue={TopicColumnsToSort.OUT_OF_SYNC_REPLICAS}
        />
        <TableColumn title="Replication Factor" field="replicationFactor" />
        <TableColumn title="Number of messages" cell={MessagesCell} />
        <TableColumn
          title="Size"
          cell={TopicSizeCell}
          orderValue={TopicColumnsToSort.SIZE}
        />
        <TableColumn maxWidth="4%" cell={ActionsCell} customTd={ActionsTd} />
      </SmartTable>
    </>
  );
};

export default TopicsTable;
