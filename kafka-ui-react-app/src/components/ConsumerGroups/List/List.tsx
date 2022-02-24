import React from 'react';
import { Table } from 'components/common/table/Table/Table.styled';
import TableHeaderCell from 'components/common/table/TableHeaderCell/TableHeaderCell';
import PageHeading from 'components/common/PageHeading/PageHeading';
import Search from 'components/common/Search/Search';
import { ControlPanelWrapper } from 'components/common/ControlPanel/ControlPanel.styled';
import { useAppDispatch, useAppSelector } from 'lib/hooks/redux';
import {
  fetchConsumerGroupsPage,
  getAreConsumerGroupsPageFulfilled,
  selectAll,
} from 'redux/reducers/consumerGroups/consumerGroupsSlice';
import { useParams } from 'react-router-dom';
import PageLoader from 'components/common/PageLoader/PageLoader';
import { ClusterName } from 'redux/interfaces';
import useSearch from 'lib/hooks/useSearch';
import usePagination from 'lib/hooks/usePagination';
import Pagination from 'components/common/Pagination/Pagination';
import useOrdering from 'lib/hooks/useOrdering';
import { ConsumerGroupOrdering } from 'generated-sources';
import { resetLoaderById } from 'redux/reducers/loader/loaderSlice';

import ListItem from './ListItem';

const List: React.FC = () => {
  const dispatch = useAppDispatch();
  const { clusterName } = useParams<{ clusterName: ClusterName }>();
  const isFetched = useAppSelector(getAreConsumerGroupsPageFulfilled);
  const consumerGroups = useAppSelector(selectAll);
  const totalPages = useAppSelector((state) => state.consumerGroups.totalPages);

  const [searchText, handleSearchText] = useSearch();
  const { page, perPage } = usePagination();
  const { orderBy, handleOrderBy, sortOrder } =
    useOrdering<ConsumerGroupOrdering>(ConsumerGroupOrdering.NAME);

  React.useEffect(() => {
    dispatch(
      fetchConsumerGroupsPage({
        clusterName,
        page,
        perPage,
        search: searchText,
        orderBy,
        sortOrder,
      })
    );
    return () => {
      dispatch(resetLoaderById('consumerGroups/fetchConsumerGroupsPage'));
    };
  }, [dispatch, clusterName, page, perPage, searchText, orderBy, sortOrder]);

  return (
    <>
      <PageHeading text="Consumers" />
      <ControlPanelWrapper hasInput>
        <Search
          placeholder="Search by Consumer Group ID"
          value={searchText}
          handleSearch={handleSearchText}
        />
      </ControlPanelWrapper>
      {isFetched ? (
        <>
          <Table isFullwidth>
            <thead>
              <tr>
                <TableHeaderCell
                  orderBy={orderBy}
                  orderValue={ConsumerGroupOrdering.NAME}
                  sortOrder={sortOrder}
                  handleOrderBy={handleOrderBy}
                  title="Consumer Group ID"
                />
                <TableHeaderCell
                  orderBy={orderBy}
                  orderValue={ConsumerGroupOrdering.MEMBERS}
                  sortOrder={sortOrder}
                  handleOrderBy={handleOrderBy}
                  title="Num Of Members"
                />
                <TableHeaderCell title="Num Of Topics" />
                <TableHeaderCell title="Messages Behind" />
                <TableHeaderCell title="Coordinator" />
                <TableHeaderCell
                  orderBy={orderBy}
                  orderValue={ConsumerGroupOrdering.STATE}
                  sortOrder={sortOrder}
                  handleOrderBy={handleOrderBy}
                  title="State"
                />
              </tr>
            </thead>
            <tbody>
              {consumerGroups.map((consumerGroup) => (
                <ListItem
                  key={consumerGroup.groupId}
                  consumerGroup={consumerGroup}
                />
              ))}
              {consumerGroups.length === 0 && (
                <tr>
                  <td colSpan={10}>No active consumer groups</td>
                </tr>
              )}
            </tbody>
          </Table>
          <Pagination totalPages={totalPages} />
        </>
      ) : (
        <PageLoader />
      )}
    </>
  );
};

export default List;
