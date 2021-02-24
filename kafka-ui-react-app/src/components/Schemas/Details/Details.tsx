import React from 'react';
import { SchemaSubject } from 'generated-sources';
import { ClusterName, SchemaName } from 'redux/interfaces';
import { clusterSchemasPath } from 'lib/paths';
import Breadcrumb from '../../common/Breadcrumb/Breadcrumb';
import SchemaVersion from './SchemaVersion';
import LatestVersionItem from './LatestVersionItem';
import PageLoader from '../../common/PageLoader/PageLoader';

export interface DetailsProps {
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
  schema,
  clusterName,
  fetchSchemaVersions,
  versions,
  isFetched,
}) => {
  React.useEffect(() => {
    fetchSchemaVersions(clusterName, schema.subject as SchemaName);
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
          {schema.subject}
        </Breadcrumb>
      </div>
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
          <div className="level-right">
            <button
              className="button is-primary is-small level-item"
              type="button"
              title="in development"
              disabled
            >
              Create Schema
            </button>
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
        </div>
        <LatestVersionItem schema={schema} />
      </div>
      {isFetched ? (
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
      ) : (
        <PageLoader />
      )}
    </div>
  );
};

export default Details;
