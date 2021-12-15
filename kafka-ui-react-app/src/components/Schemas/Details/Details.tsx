import React from 'react';
import { useHistory } from 'react-router';
import { SchemaSubject } from 'generated-sources';
import { ClusterName, SchemaName } from 'redux/interfaces';
import { clusterSchemasPath, clusterSchemaSchemaEditPath } from 'lib/paths';
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

import LatestVersionItem from './LatestVersion/LatestVersionItem';
import SchemaVersion from './SchemaVersion/SchemaVersion';
import { OldVersionsTitle } from './SchemaVersion/SchemaVersion.styled';

export interface DetailsProps {
  subject: SchemaName;
  schema: SchemaSubject;
  clusterName: ClusterName;
  versions: SchemaSubject[];
  areVersionsFetched: boolean;
  areSchemasFetched: boolean;
  fetchSchemaVersions: (
    clusterName: ClusterName,
    schemaName: SchemaName
  ) => void;
  fetchSchemasByClusterName: (clusterName: ClusterName) => void;
  deleteSchema: (clusterName: ClusterName, subject: string) => Promise<void>;
}

const Details: React.FC<DetailsProps> = ({
  subject,
  schema,
  clusterName,
  fetchSchemaVersions,
  fetchSchemasByClusterName,
  deleteSchema,
  versions,
  areVersionsFetched,
  areSchemasFetched,
}) => {
  const { isReadOnly } = React.useContext(ClusterContext);
  const [
    isDeleteSchemaConfirmationVisible,
    setDeleteSchemaConfirmationVisible,
  ] = React.useState(false);

  React.useEffect(() => {
    fetchSchemasByClusterName(clusterName);
    fetchSchemaVersions(clusterName, subject);
  }, [fetchSchemaVersions, fetchSchemasByClusterName, clusterName]);

  const history = useHistory();
  const onDelete = React.useCallback(() => {
    deleteSchema(clusterName, subject);
    history.push(clusterSchemasPath(clusterName));
  }, [deleteSchema, clusterName, subject]);

  return (
    <div>
      {areVersionsFetched && areSchemasFetched ? (
        <>
          <div>
            <PageHeading text={schema.subject}>
              {!isReadOnly && (
                <>
                  <Button
                    isLink
                    buttonSize="M"
                    buttonType="primary"
                    to={clusterSchemaSchemaEditPath(clusterName, subject)}
                  >
                    Edit Schema
                  </Button>
                  <Dropdown label={<VerticalElipsisIcon />} right>
                    <DropdownItem
                      onClick={() => setDeleteSchemaConfirmationVisible(true)}
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
          </div>
          <OldVersionsTitle>Old versions</OldVersionsTitle>
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
        </>
      ) : (
        <PageLoader />
      )}
    </div>
  );
};

export default Details;
