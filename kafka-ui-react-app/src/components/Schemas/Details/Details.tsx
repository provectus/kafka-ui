import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ClusterSubjectParam,
  clusterSchemaEditPageRelativePath,
  clusterSchemaSchemaComparePageRelativePath,
  clusterSchemasPath,
} from 'lib/paths';
import ClusterContext from 'components/contexts/ClusterContext';
import PageLoader from 'components/common/PageLoader/PageLoader';
import PageHeading from 'components/common/PageHeading/PageHeading';
import { Button } from 'components/common/Button/Button';
import { Table } from 'components/common/table/Table/Table.styled';
import TableHeaderCell from 'components/common/table/TableHeaderCell/TableHeaderCell';
import { useAppDispatch, useAppSelector } from 'lib/hooks/redux';
import {
  fetchLatestSchema,
  fetchSchemaVersions,
  getAreSchemaLatestFulfilled,
  getAreSchemaVersionsFulfilled,
  SCHEMAS_VERSIONS_FETCH_ACTION,
  SCHEMA_LATEST_FETCH_ACTION,
  selectAllSchemaVersions,
  getSchemaLatest,
} from 'redux/reducers/schemas/schemasSlice';
import { showServerError } from 'lib/errorHandling';
import { resetLoaderById } from 'redux/reducers/loader/loaderSlice';
import { TableTitle } from 'components/common/table/TableTitle/TableTitle.styled';
import useAppParams from 'lib/hooks/useAppParams';
import { schemasApiClient } from 'lib/api';
import { Dropdown, DropdownItem } from 'components/common/Dropdown';

import LatestVersionItem from './LatestVersion/LatestVersionItem';
import SchemaVersion from './SchemaVersion/SchemaVersion';

const Details: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { isReadOnly } = React.useContext(ClusterContext);
  const { clusterName, subject } = useAppParams<ClusterSubjectParam>();

  React.useEffect(() => {
    dispatch(fetchLatestSchema({ clusterName, subject }));
    return () => {
      dispatch(resetLoaderById(SCHEMA_LATEST_FETCH_ACTION));
    };
  }, [clusterName, dispatch, subject]);

  React.useEffect(() => {
    dispatch(fetchSchemaVersions({ clusterName, subject }));
    return () => {
      dispatch(resetLoaderById(SCHEMAS_VERSIONS_FETCH_ACTION));
    };
  }, [clusterName, dispatch, subject]);

  const versions = useAppSelector((state) => selectAllSchemaVersions(state));
  const schema = useAppSelector(getSchemaLatest);
  const isFetched = useAppSelector(getAreSchemaLatestFulfilled);
  const areVersionsFetched = useAppSelector(getAreSchemaVersionsFulfilled);

  const deleteHandler = async () => {
    try {
      await schemasApiClient.deleteSchema({
        clusterName,
        subject,
      });
      navigate('../');
    } catch (e) {
      showServerError(e as Response);
    }
  };

  if (!isFetched || !schema) {
    return <PageLoader />;
  }
  return (
    <>
      <PageHeading
        text={schema.subject}
        backText="Schema Registry"
        backTo={clusterSchemasPath(clusterName)}
      >
        {!isReadOnly && (
          <>
            <Button
              buttonSize="M"
              buttonType="primary"
              to={{
                pathname: clusterSchemaSchemaComparePageRelativePath,
                search: `leftVersion=${versions[0]?.version}&rightVersion=${versions[0]?.version}`,
              }}
            >
              Compare Versions
            </Button>
            <Button
              buttonSize="M"
              buttonType="primary"
              to={clusterSchemaEditPageRelativePath}
            >
              Edit Schema
            </Button>
            <Dropdown>
              <DropdownItem
                confirm={
                  <>
                    Are you sure want to remove <b>{subject}</b> schema?
                  </>
                }
                onClick={deleteHandler}
                danger
              >
                Remove schema
              </DropdownItem>
            </Dropdown>
          </>
        )}
      </PageHeading>
      <LatestVersionItem schema={schema} />
      <TableTitle>Old versions</TableTitle>
      {areVersionsFetched ? (
        <Table isFullwidth>
          <thead>
            <tr>
              <TableHeaderCell />
              <TableHeaderCell title="Version" />
              <TableHeaderCell title="ID" />
              <TableHeaderCell title="Type" />
            </tr>
          </thead>
          <tbody>
            {versions.map((version) => (
              <SchemaVersion key={version.id} version={version} />
            ))}
            {versions.length === 0 && (
              <tr>
                <td colSpan={10}>No active Schema</td>
              </tr>
            )}
          </tbody>
        </Table>
      ) : (
        <PageLoader />
      )}
    </>
  );
};

export default Details;
