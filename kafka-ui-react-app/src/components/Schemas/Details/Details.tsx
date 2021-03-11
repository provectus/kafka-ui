import React from 'react';
import { SchemaSubject } from 'generated-sources';
import { ClusterName, SchemaName } from 'redux/interfaces';
import { clusterSchemasPath } from 'lib/paths';
import ClusterContext from 'components/contexts/ClusterContext';
import Breadcrumb from '../../common/Breadcrumb/Breadcrumb';
import SchemaVersion from './SchemaVersion';
import LatestVersionItem from './LatestVersionItem';
import PageLoader from '../../common/PageLoader/PageLoader';

export interface DetailsProps {
  subject: SchemaName;
  schema: SchemaSubject;
  clusterName: ClusterName;
  versions: SchemaSubject[];
  isFetched: boolean;
  fetchSchemaVersions: (
    clusterName: ClusterName,
    schemaName: SchemaName
  ) => void;
}

const Details: React.FC<DetailsProps> = ({
  subject,
  schema,
  clusterName,
  fetchSchemaVersions,
  versions,
  isFetched,
}) => {
  const { isReadOnly } = React.useContext(ClusterContext);
  React.useEffect(() => {
    fetchSchemaVersions(clusterName, subject);
  }, [fetchSchemaVersions, clusterName]);

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
      {isFetched ? (
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
                <div className="level-right">
                  <button
                    className="button is-warning is-small level-item"
                    type="button"
                    title="in development"
                    disabled
                  >
                    Update Schema
                  </button>
                  <button
                    className="button is-danger is-small level-item"
                    type="button"
                    title="in development"
                    disabled
                  >
                    Delete
                  </button>
                </div>
              )}
            </div>
            <LatestVersionItem schema={schema} />
          </div>
          <div className="box">
            <table className="table is-striped is-fullwidth">
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
