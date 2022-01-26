import React from 'react';
import { useHistory, useParams } from 'react-router';
import { clusterSchemasPath, clusterSchemaEditPath } from 'lib/paths';
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
  fetchSchemaVersions,
  getAreSchemasFulfilled,
  getAreSchemaVersionsFulfilled,
  schemasApiClient,
  selectAllSchemaVersions,
  selectSchemaById,
} from 'redux/reducers/schemas/schemasSlice';
import { serverErrorAlertAdded } from 'redux/reducers/alerts/alertsSlice';
import { getResponse } from 'lib/errorHandling';

import LatestVersionItem from './LatestVersion/LatestVersionItem';
import SchemaVersion from './SchemaVersion/SchemaVersion';
import { OldVersionsTitle } from './SchemaVersion/SchemaVersion.styled';

const Details: React.FC = () => {
  const history = useHistory();
  const dispatch = useAppDispatch();
  const { isReadOnly } = React.useContext(ClusterContext);
  const { clusterName, subject } =
    useParams<{ clusterName: string; subject: string }>();
  const [
    isDeleteSchemaConfirmationVisible,
    setDeleteSchemaConfirmationVisible,
  ] = React.useState(false);

  React.useEffect(() => {
    dispatch(fetchSchemaVersions({ clusterName, subject }));
  }, []);

  const areSchemasFetched = useAppSelector(getAreSchemasFulfilled);
  const areVersionsFetched = useAppSelector(getAreSchemaVersionsFulfilled);
  const schema = useAppSelector((state) => selectSchemaById(state, subject));
  const versions = useAppSelector((state) =>
    selectAllSchemaVersions(state).filter((v) => v.subject === subject)
  );

  const onDelete = React.useCallback(async () => {
    try {
      await schemasApiClient.deleteSchema({
        clusterName,
        subject,
      });
      history.push(clusterSchemasPath(clusterName));
    } catch (e) {
      const err = await getResponse(e as Response);
      dispatch(serverErrorAlertAdded(err));
    }
  }, [clusterName, subject]);

  if (!areSchemasFetched || !schema) {
    return <PageLoader />;
  }

  return (
    <>
      <PageHeading text={schema.subject}>
        {!isReadOnly && (
          <>
            <Button
              isLink
              buttonSize="M"
              buttonType="primary"
              to={clusterSchemaEditPath(clusterName, subject)}
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
      <OldVersionsTitle>Old versions</OldVersionsTitle>
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
