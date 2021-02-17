import { SchemaSubject } from 'generated-sources';
import React from 'react';
import { ClusterName, SchemaName } from 'redux/interfaces';
import JSONViewer from 'components/common/JSONViewer/JSONViewer';
import Breadcrumb from '../../common/Breadcrumb/Breadcrumb';
import { clusterSchemasPath } from '../../../lib/paths';
import SchemaVersion from './SchemaVersion';

interface DetailsProps {
  schema: SchemaSubject;
  clusterName: ClusterName;
  subject: SchemaName;
  versions: SchemaSubject[];
  fetchSchemaVersions: (
    clusterName: ClusterName,
    schemaName: SchemaName
  ) => void;
}

const Details: React.FC<DetailsProps> = ({
  schema,
  clusterName,
  fetchSchemaVersions,
  subject,
  versions,
}) => {
  React.useEffect(() => {
    fetchSchemaVersions(clusterName, subject);
  }, [fetchSchemaVersions, clusterName]);

  return (
    <div className="section">
      <div className="level">
        <div className="level-item level-left">
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
      </div>
      <div className="box">
        <div className="level-left">
          <div className="level-item">
            <div className="mr-1">
              <b>Latest Version</b>
            </div>
            <div className="tag is-info is-light" title="Version">
              #{schema.version}
            </div>
          </div>
          <button
            className="button is-info is-small level-item"
            type="button"
            title="work in progress"
            disabled
          >
            Create Schema
          </button>
          <button
            className="button is-warning is-small level-item"
            type="button"
            title="work in progress"
            disabled
          >
            Update Schema
          </button>
          <button
            className="button is-danger is-small level-item"
            type="button"
            title="work in progress"
            disabled
          >
            Delete
          </button>
        </div>
        <div className="tile is-ancestor mt-1">
          <div className="tile is-4 is-parent">
            <div className="tile is-child">
              <table className="table is-fullwidth">
                <tbody>
                  <tr>
                    <td>ID</td>
                    <td>{schema.id}</td>
                  </tr>
                  <tr>
                    <td>Subject</td>
                    <td>{schema.subject}</td>
                  </tr>
                  <tr>
                    <td>Compatibility</td>
                    <td>{schema.compatibilityLevel}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <div className="tile is-parent">
            <div className="tile is-child box py-1">
              <JSONViewer data={JSON.parse(schema.schema as string)} />
            </div>
          </div>
        </div>
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
            {versions
              .sort((a: SchemaSubject, b: SchemaSubject) => a.id - b.id)
              .map((version) => (
                <SchemaVersion key={version.id} version={version} />
              ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Details;
