import React from 'react';
import { ClusterNameRoute, clusterSchemaNewRelativePath } from 'lib/paths';
import ClusterContext from 'components/contexts/ClusterContext';
import * as C from 'components/common/table/Table/Table.styled';
import TableHeaderCell from 'components/common/table/TableHeaderCell/TableHeaderCell';
import { Button } from 'components/common/Button/Button';
import PageHeading from 'components/common/PageHeading/PageHeading';
import { useAppDispatch, useAppSelector } from 'lib/hooks/redux';
import useAppParams from 'lib/hooks/useAppParams';
import {
  selectAllSchemas,
  fetchSchemas,
  getAreSchemasFulfilled,
  SCHEMAS_FETCH_ACTION,
} from 'redux/reducers/schemas/schemasSlice';
import usePagination from 'lib/hooks/usePagination';
import PageLoader from 'components/common/PageLoader/PageLoader';
import Pagination from 'components/common/Pagination/Pagination';
import { resetLoaderById } from 'redux/reducers/loader/loaderSlice';
import { ControlPanelWrapper } from 'components/common/ControlPanel/ControlPanel.styled';
import Search from 'components/common/Search/Search';
import useSearch from 'lib/hooks/useSearch';
import PlusIcon from 'components/common/Icons/PlusIcon';

import ListItem from './ListItem';
import GlobalSchemaSelector from './GlobalSchemaSelector/GlobalSchemaSelector';

const List: React.FC = () => {
  const dispatch = useAppDispatch();
  const { isReadOnly } = React.useContext(ClusterContext);
  const { clusterName } = useAppParams<ClusterNameRoute>();

  const schemas = useAppSelector(selectAllSchemas);
  const isFetched = useAppSelector(getAreSchemasFulfilled);
  const totalPages = useAppSelector((state) => state.schemas.totalPages);

  const [searchText, handleSearchText] = useSearch();
  const { page, perPage } = usePagination();

  React.useEffect(() => {
    dispatch(fetchSchemas({ clusterName, page, perPage, search: searchText }));
    return () => {
      dispatch(resetLoaderById(SCHEMAS_FETCH_ACTION));
    };
  }, [clusterName, dispatch, page, perPage, searchText]);

  return (
    <>
      <PageHeading text="Schema Registry">
        {!isReadOnly && (
          <>
            <GlobalSchemaSelector />
            <Button
              buttonSize="M"
              buttonType="primary"
              to={clusterSchemaNewRelativePath}
            >
              <PlusIcon /> Create Schema
            </Button>
          </>
        )}
      </PageHeading>
      <ControlPanelWrapper hasInput>
        <Search
          placeholder="Search by Schema Name"
          value={searchText}
          handleSearch={handleSearchText}
        />
      </ControlPanelWrapper>
      {isFetched ? (
        <>
          <C.Table isFullwidth>
            <thead>
              <tr>
                <TableHeaderCell title="Schema Name" />
                <TableHeaderCell title="Version" />
                <TableHeaderCell title="Compatibility" />
              </tr>
            </thead>
            <tbody>
              {schemas.length === 0 && (
                <tr>
                  <td colSpan={10}>No schemas found</td>
                </tr>
              )}
              {schemas.map((subject) => (
                <ListItem
                  key={[subject.id, subject.subject].join('-')}
                  subject={subject}
                />
              ))}
            </tbody>
          </C.Table>
          <Pagination totalPages={totalPages} />
        </>
      ) : (
        <PageLoader />
      )}
    </>
  );
};

export default List;
