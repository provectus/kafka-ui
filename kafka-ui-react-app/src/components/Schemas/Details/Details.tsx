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
  getAreSchemaLatestRejected,
} from 'redux/reducers/schemas/schemasSlice';
import { showServerError } from 'lib/errorHandling';
import { resetLoaderById } from 'redux/reducers/loader/loaderSlice';
import { TableTitle } from 'components/common/table/TableTitle/TableTitle.styled';
import useAppParams from 'lib/hooks/useAppParams';
import { schemasApiClient } from 'lib/api';
import { Dropdown } from 'components/common/Dropdown';
import Table from 'components/common/NewTable';
import { Action, ResourceType } from 'generated-sources';
import {
  ActionButton,
  ActionDropdownItem,
} from 'components/common/ActionComponent';

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
  const isRejected = useAppSelector(getAreSchemaLatestRejected);
  const areVersionsFetched = useAppSelector(getAreSchemaVersionsFulfilled);

  const columns = React.useMemo(
    () => [
      { header: 'Version', accessorKey: 'version' },
      { header: 'ID', accessorKey: 'id' },
      { header: 'Type', accessorKey: 'schemaType' },
    ],
    []
  );

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

  if (isRejected) {
    navigate('/404');
  }

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
            <ActionButton
              buttonSize="M"
              buttonType="primary"
              to={clusterSchemaEditPageRelativePath}
              permission={{
                resource: ResourceType.SCHEMA,
                action: Action.EDIT,
                value: subject,
              }}
            >
              Edit Schema
            </ActionButton>
            <Dropdown>
              <ActionDropdownItem
                confirm={
                  <>
                    Are you sure want to remove <b>{subject}</b> schema?
                  </>
                }
                onClick={deleteHandler}
                danger
                permission={{
                  resource: ResourceType.SCHEMA,
                  action: Action.DELETE,
                  value: subject,
                }}
              >
                Remove schema
              </ActionDropdownItem>
            </Dropdown>
          </>
        )}
      </PageHeading>
      <LatestVersionItem schema={schema} />
      <TableTitle>Old versions</TableTitle>
      {areVersionsFetched ? (
        <Table
          columns={columns}
          data={versions}
          getRowCanExpand={() => true}
          renderSubComponent={SchemaVersion}
          enableSorting
        />
      ) : (
        <PageLoader />
      )}
    </>
  );
};

export default Details;
