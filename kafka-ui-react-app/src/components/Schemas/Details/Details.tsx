import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ClusterSubjectParam,
  clusterSchemaEditPageRelativePath,
  clusterSchemaSchemaComparePageRelativePath,
} from 'lib/paths';
import ClusterContext from 'components/contexts/ClusterContext';
import ConfirmationModal from 'components/common/ConfirmationModal/ConfirmationModal';
import PageLoader from 'components/common/PageLoader/PageLoader';
import PageHeading from 'components/common/PageHeading/PageHeading';
import { Button } from 'components/common/Button/Button';
import Dropdown from 'components/common/Dropdown/Dropdown';
import DropdownItem from 'components/common/Dropdown/DropdownItem';
import VerticalElipsisIcon from 'components/common/Icons/VerticalElipsisIcon';
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
import { serverErrorAlertAdded } from 'redux/reducers/alerts/alertsSlice';
import { getResponse } from 'lib/errorHandling';
import { resetLoaderById } from 'redux/reducers/loader/loaderSlice';
import { TableTitle } from 'components/common/table/TableTitle/TableTitle.styled';
import useAppParams from 'lib/hooks/useAppParams';
import { schemasApiClient } from 'lib/api';

import LatestVersionItem from './LatestVersion/LatestVersionItem';
import SchemaVersion from './SchemaVersion/SchemaVersion';

const Details: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { isReadOnly } = React.useContext(ClusterContext);
  const { clusterName, subject } = useAppParams<ClusterSubjectParam>();
  const [
    isDeleteSchemaConfirmationVisible,
    setDeleteSchemaConfirmationVisible,
  ] = React.useState(false);

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

  const onDelete = async () => {
    try {
      await schemasApiClient.deleteSchema({
        clusterName,
        subject,
      });
      navigate('../');
    } catch (e) {
      const err = await getResponse(e as Response);
      dispatch(serverErrorAlertAdded(err));
    }
  };

  if (!isFetched || !schema) {
    return <PageLoader />;
  }
  return (
    <>
      <PageHeading text={schema.subject}>
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
            <Dropdown label={<VerticalElipsisIcon />} right>
              <DropdownItem
                onClick={() => setDeleteSchemaConfirmationVisible(true)}
                danger
              >
                Remove schema
              </DropdownItem>
            </Dropdown>
            <ConfirmationModal
              isOpen={isDeleteSchemaConfirmationVisible}
              onCancel={() => setDeleteSchemaConfirmationVisible(false)}
              onConfirm={onDelete}
            >
              Are you sure want to remove <b>{subject}</b> schema?
            </ConfirmationModal>
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
