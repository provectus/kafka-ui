import React from 'react';
import { useHistory } from 'react-router';
import { SchemaSubject } from 'generated-sources';
import { ClusterName, SchemaName } from 'redux/interfaces';
import { clusterSchemasPath, clusterSchemaSchemaEditPath } from 'lib/paths';
import Breadcrumb from 'components/common/Breadcrumb/Breadcrumb';
import ClusterContext from 'components/contexts/ClusterContext';
import { Link } from 'react-router-dom';
import ConfirmationModal from 'components/common/ConfirmationModal/ConfirmationModal';
import PageLoader from 'components/common/PageLoader/PageLoader';

import SchemaVersion from './SchemaVersion';
import LatestVersionItem from './LatestVersionItem';

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
    <div className="section">
      <div className="level">
        <Breadcrumb
          links={[
            {
              href: clusterSchemasPath(clusterName),
              label: 'Schema Registry',
            },
          ]}
        >
          {subject}
        </Breadcrumb>
      </div>
      {areVersionsFetched && areSchemasFetched ? (
        <>
          <div className="box">
            <div className="level">
              <div className="level-left">
                <div className="level-item">
                  <div className="mr-1">
                    <b>Latest Version</b>
                  </div>
                  <div className="tag is-info is-light" title="Version">
                    #{schema.version}
                  </div>
                </div>
              </div>
              {!isReadOnly && (
                <div className="level-right buttons">
                  <Link
                    className="button is-warning"
                    type="button"
                    to={clusterSchemaSchemaEditPath(clusterName, subject)}
                  >
                    Edit Schema
                  </Link>
                  <button
                    className="button is-danger"
                    type="button"
                    onClick={() => setDeleteSchemaConfirmationVisible(true)}
                  >
                    Remove
                  </button>
                  <ConfirmationModal
                    isOpen={isDeleteSchemaConfirmationVisible}
                    onCancel={() => setDeleteSchemaConfirmationVisible(false)}
                    onConfirm={onDelete}
                  >
                    Are you sure want to remove <b>{subject}</b> schema?
                  </ConfirmationModal>
                </div>
              )}
            </div>
            <LatestVersionItem schema={schema} />
          </div>
          <div className="box">
            <table className="table is-fullwidth">
              <thead>
                <tr>
                  <th>Version</th>
                  <th>ID</th>
                  <th>Schema</th>
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
            </table>
          </div>
        </>
      ) : (
        <PageLoader />
      )}
    </div>
  );
};

export default Details;
